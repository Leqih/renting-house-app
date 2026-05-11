import { useState, useMemo, useRef } from 'react'
import { listings } from '../../data/listings'
import Map3DView from '../../components/Map3DView'
import WebListingDetailScreen from './WebListingDetailScreen'
import type { StudentProfile } from '../../data/profile'
import type { SubleasePin } from '../../components/Map3DView'

interface Props {
  onViewListing: (id: number, collegeId?: string | null) => void
  onNavigate?: (tab: string) => void
  initialListingId?: number | null
  initialSubleaseId?: number | null
  savedIds?: Set<number>
  onToggleSave?: (id: number) => void
}

const placeTypes = [
  { id: 'apartments', label: 'Apartments', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6M15 3v18M15 9h6M15 15h6"/></svg>
  )},
  { id: 'house', label: 'House', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  )},
  { id: 'studio', label: 'Studio', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16"/></svg>
  )},
  { id: 'room', label: 'Room', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h20v16H2z"/><path d="M12 4v16"/></svg>
  )},
]

const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+']
const floorOptions = ['1', '2', '3', '4', '5', '6+']

const amenityOptions = [
  { key: 'laundry', label: 'In-unit laundry' },
  { key: 'pet',     label: 'Pets allowed' },
  { key: 'parking', label: 'Parking' },
  { key: 'study',   label: 'Study room' },
  { key: 'common',  label: 'Common space' },
  { key: 'gym',     label: 'Gym' },
]

interface Area {
  id: string
  label: string
  emoji: string
  color: string
  textColor: string
  listingIds: number[]
}

const areas: Area[] = [
  { id: 'green', label: 'Green Street', emoji: '🏙️', color: 'bg-emerald-100', textColor: 'text-emerald-700', listingIds: [2, 3, 9, 10, 11, 12] },
  { id: 'quad', label: 'Main Quad', emoji: '🎓', color: 'bg-purple-100', textColor: 'text-purple-700', listingIds: [4, 7] },
  { id: 'first', label: 'First Street', emoji: '🏘️', color: 'bg-blue-100', textColor: 'text-blue-700', listingIds: [1, 5] },
  { id: 'chalmers', label: 'Chalmers', emoji: '🌆', color: 'bg-orange-100', textColor: 'text-orange-700', listingIds: [6] },
  { id: 'south', label: 'South Campus', emoji: '🌿', color: 'bg-lime-100', textColor: 'text-lime-700', listingIds: [8] },
]

// ── Sublease mock data ──────────────────────────────────────────────────────
type SubleaseType = 'sublease' | 'transfer' | 'roomshare'

interface SubleaseItem {
  id: number
  type: SubleaseType
  name: string
  address: string
  price: number
  marketRate: number          // original market price for comparison
  via: 'individual' | 'official'
  utilitiesIncluded: boolean
  utilitiesNote: string
  beds: string
  sqft: string
  img: string
  badge: string
  badgeColor: string
  availableFrom: string       // ISO date "2025-05-01"
  availableTo: string         // ISO date "2025-08-15"
  leaseEnds?: string          // for transfer: full lease end date
  renewalPossible?: boolean
  totalRooms?: number         // for roomshare
  postedBy: string
  daysUntilLeave: number      // urgency signal
  furnished: boolean
  amenities: string[]
  area: string
  listingId: number
}

const subleaseListings: SubleaseItem[] = [
  // 🔄 转租 — 暑期走人，临时顶租
  {
    id: 101, type: 'sublease',
    name: 'Green St Studio',
    address: '302 E Green St, Champaign',
    price: 620, marketRate: 950,
    via: 'individual', utilitiesIncluded: true,
    utilitiesNote: '水电暖+网络全含，拎包即住',
    beds: 'Studio', sqft: '490 sqft',
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
    badge: '转租', badgeColor: 'bg-orange-100 text-orange-700',
    availableFrom: '2025-05-01', availableTo: '2025-08-15',
    postedBy: 'Sarah K.', daysUntilLeave: 12,
    furnished: true,
    amenities: ['Furnished', 'Utilities incl.', 'Study room', 'Common space'],
    area: 'green', listingId: 3,
  },
  {
    id: 102, type: 'sublease',
    name: '1BR near Chalmers',
    address: '508 E Chalmers St, Champaign',
    price: 750, marketRate: 1100,
    via: 'individual', utilitiesIncluded: false,
    utilitiesNote: '含水费；电费+网费自付 (~$80/mo)',
    beds: '1B1B', sqft: '650 sqft',
    img: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&q=80',
    badge: '转租', badgeColor: 'bg-orange-100 text-orange-700',
    availableFrom: '2025-06-01', availableTo: '2025-08-31',
    postedBy: 'Mike T.', daysUntilLeave: 28,
    furnished: false,
    amenities: ['Parking', 'Gym', 'Common space'],
    area: 'chalmers', listingId: 6,
  },
  // 📋 转让 — 直接接盘合同
  {
    id: 103, type: 'transfer',
    name: '2BR near Main Quad',
    address: '410 E John St, Champaign',
    price: 880, marketRate: 1200,
    via: 'official', utilitiesIncluded: true,
    utilitiesNote: '含水暖；电费自付 (~$45/mo)',
    beds: '2B1B', sqft: '820 sqft',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
    badge: '转让', badgeColor: 'bg-blue-100 text-blue-700',
    availableFrom: '2025-08-01', availableTo: '2026-07-31',
    leaseEnds: '2026-07-31', renewalPossible: true,
    postedBy: 'Emma L.', daysUntilLeave: 60,
    furnished: true,
    amenities: ['Furnished', 'Gym', 'Study room', 'Common space'],
    area: 'quad', listingId: 4,
  },
  // 🏠 合租 — 室友在住，找人分摊
  {
    id: 104, type: 'roomshare',
    name: 'Room in 3BR · First St',
    address: '1011 S First St, Champaign',
    price: 510, marketRate: 700,
    via: 'individual', utilitiesIncluded: true,
    utilitiesNote: '所有费用全含，零额外支出',
    beds: 'Private Room', sqft: '380 sqft',
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    badge: '合租', badgeColor: 'bg-purple-100 text-purple-700',
    availableFrom: '2025-05-15', availableTo: '2025-12-31',
    totalRooms: 3,
    postedBy: 'Alex R.', daysUntilLeave: 5,
    furnished: true,
    amenities: ['Furnished', 'Utilities incl.', 'Parking', 'Study room'],
    area: 'first', listingId: 1,
  },
  // 📋 转让 — 毕业离校，接剩余租期
  {
    id: 105, type: 'transfer',
    name: '1BR South Campus',
    address: '901 S Lincoln Ave, Urbana',
    price: 690, marketRate: 950,
    via: 'individual', utilitiesIncluded: false,
    utilitiesNote: '含水费；电费+网费自付 (~$100/mo)',
    beds: '1B1B', sqft: '580 sqft',
    img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
    badge: '转让', badgeColor: 'bg-blue-100 text-blue-700',
    availableFrom: '2026-01-10', availableTo: '2026-07-31',
    leaseEnds: '2026-07-31', renewalPossible: false,
    postedBy: 'Jessica P.', daysUntilLeave: 90,
    furnished: false,
    amenities: ['Parking', 'Common space', 'Gym'],
    area: 'south', listingId: 8,
  },
]

// ── Date helpers ─────────────────────────────────────────────────────────────
const fmtDate = (d: string) => {
  const [, m, day] = d.split('-')
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1] + ' ' + +day
}
const discountPct = (price: number, market: number) => Math.round((1 - price / market) * 100)

const subleaseTypeOptions = [
  { id: 'all' as const,       label: '全部',    desc: '所有类型' },
  { id: 'sublease' as const,  label: '🔄 转租',  desc: '临时顶租，房东会回来' },
  { id: 'transfer' as const,  label: '📋 转让',  desc: '直接接盘合同' },
  { id: 'roomshare' as const, label: '🏠 合租',  desc: '室友在住，分摊房间' },
]

export default function WebExploreScreen({ onViewListing: _onViewListing, onNavigate, initialListingId, initialSubleaseId, savedIds, onToggleSave }: Props) {
  const [profile] = useState<StudentProfile>({ college: null, budgetMax: 900, beds: 'any' })
  const [localDetailId, setLocalDetailId] = useState<number | null>(null)
  const [mode, setMode] = useState<'rent' | 'sublease'>(initialSubleaseId ? 'sublease' : 'rent')

  // Rent filters
  const [placeType, setPlaceType] = useState('apartments')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedBed, setSelectedBed] = useState<string>('')
  const [selectedFloor, setSelectedFloor] = useState<string>('')
  const [priceMin, setPriceMin] = useState(500)
  const [priceMax, setPriceMax] = useState(1100)
  const [minInput, setMinInput] = useState('500')
  const [maxInput, setMaxInput] = useState('1100')
  const minDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [amenities, setAmenities] = useState<Set<string>>(new Set())

  // Sublease filters
  const [subleaseType, setSubleaseType] = useState<'all' | 'sublease' | 'transfer' | 'roomshare'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [minDiscount, setMinDiscount] = useState<number | null>(null)
  const [urgencyFilter, setUrgencyFilter] = useState<'urgent' | 'soon' | 'relaxed' | null>(null)
  const [subleaseBed, setSubleaseBed] = useState<string>('')
  const [subleaseArea, setSubleaseArea] = useState<string>('')
  const [subleasePriceMin, setSubleasePriceMin] = useState(400)
  const [subleasePriceMax, setSubleasePriceMax] = useState(1200)
  const [subMinInput, setSubMinInput] = useState('400')
  const [subMaxInput, setSubMaxInput] = useState('1200')
  const subMinDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subMaxDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [highlightPinId] = useState<number | null>(initialSubleaseId ?? initialListingId ?? null)
  const [localSubleaseId, setLocalSubleaseId] = useState<number | null>(null)
  const [messageTarget, setMessageTarget] = useState<SubleasePin | null>(null)
  const [messageText, setMessageText] = useState('')

  const toggleAmenity = (k: string) => setAmenities(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })

  // Rent filter logic
  const filtered = listings.filter(l => {
    if (placeType === 'studio' && !l.beds.toLowerCase().includes('studio')) return false
    // 'house' and 'room' types not in current dataset — show all listings
    if (selectedArea) {
      const area = areas.find(a => a.id === selectedArea)
      if (area && !area.listingIds.includes(l.id)) return false
    }
    if (selectedBed) {
      if (selectedBed === 'Studio' && !l.beds.toLowerCase().includes('studio')) return false
      if (selectedBed !== 'Studio' && selectedBed !== '5+' && !l.beds.startsWith(selectedBed + 'B')) return false
      if (selectedBed === '5+' && !l.beds.startsWith('5B') && !l.beds.startsWith('6B')) return false
    }
    if (selectedFloor) {
      const match = l.floor?.match(/Floor\s*(\d+)/i)
      const floorNum = match ? parseInt(match[1]) : null
      if (selectedFloor === '6+') {
        if (floorNum == null || floorNum < 6) return false
      } else {
        if (floorNum == null || floorNum !== parseInt(selectedFloor)) return false
      }
    }
    if (l.price < priceMin || l.price > priceMax) return false
    if (amenities.size > 0) {
      for (const a of amenities) {
        if (!l.amenities.some(la => la.toLowerCase().includes(a.toLowerCase()))) return false
      }
    }
    return true
  })

  // Sublease filter logic
  const filteredSubleases = subleaseListings.filter(s => {
    if (subleaseType !== 'all' && s.type !== subleaseType) return false
    if (subleaseArea && s.area !== subleaseArea) return false
    if (subleaseBed) {
      if (subleaseBed === 'Studio' && s.beds !== 'Studio' && s.beds !== 'Private Room') return false
      if (subleaseBed === '3+') { const n = parseInt(s.beds); if (isNaN(n) || n < 3) return false }
      else if (subleaseBed !== 'Studio' && !s.beds.startsWith(subleaseBed + 'B')) return false
    }
    if (s.price < subleasePriceMin || s.price > subleasePriceMax) return false
    // Date overlap: selected range must fall within availability window
    if (dateFrom) {
      const reqFrom = new Date(dateFrom), avFrom = new Date(s.availableFrom), avTo = new Date(s.availableTo)
      if (reqFrom < avFrom || reqFrom > avTo) return false
    }
    if (dateTo) {
      const reqTo = new Date(dateTo), avTo = new Date(s.availableTo)
      if (reqTo > avTo) return false
    }
    // Discount filter
    if (minDiscount !== null && discountPct(s.price, s.marketRate) < minDiscount) return false
    // Urgency filter
    if (urgencyFilter === 'urgent' && s.daysUntilLeave > 7) return false
    if (urgencyFilter === 'soon' && (s.daysUntilLeave <= 7 || s.daysUntilLeave > 21)) return false
    if (urgencyFilter === 'relaxed' && s.daysUntilLeave <= 21) return false
    return true
  })

  // Memoize so Map3DView's subleasePins useEffect doesn't reset selectedId on every render
  const subleasePinsForMap = useMemo<SubleasePin[]>(() => filteredSubleases.map(s => ({
    id: s.id, type: s.type, name: s.name, address: s.address,
    price: s.price, marketRate: s.marketRate,
    via: s.via, utilitiesIncluded: s.utilitiesIncluded,
    img: s.img, beds: s.beds, sqft: s.sqft,
    availableFrom: s.availableFrom, availableTo: s.availableTo,
    badge: s.badge, badgeColor: s.badgeColor, listingId: s.listingId,
    daysUntilLeave: s.daysUntilLeave, postedBy: s.postedBy, furnished: s.furnished,
    leaseEnds: s.leaseEnds, renewalPossible: s.renewalPossible, totalRooms: s.totalRooms,
  })), [filteredSubleases.map(s => s.id).join(',')]); // eslint-disable-line

  // ── Full-area detail view ──────────────────────────────────────────────────
  if (localDetailId) {
    const dl = listings.find(l => l.id === localDetailId)!
    return (
      <div className="flex flex-1 overflow-hidden" style={{ animation: 'slideInDetail 0.2s cubic-bezier(0.4,0,0.2,1)' }}>
        <style>{`@keyframes slideInDetail { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }`}</style>
        <WebListingDetailScreen
          listing={dl}
          onBack={() => setLocalDetailId(null)}
          selectedCollegeId={selectedArea || null}
          onNavigate={(tab) => { setLocalDetailId(null); onNavigate?.(tab); }}
        />
      </div>
    )
  }

  // ── Reusable desktop message modal ───────────────────────────────────────
  const renderMessageModal = (onSend: () => void) => !messageTarget ? null : (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setMessageTarget(null)}>
      <div className="bg-white rounded-2xl w-[500px] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}
        style={{ animation: 'cardIn 0.18s ease' }}>
        <style>{`@keyframes cardIn { from { opacity:0; transform:scale(0.97) translateY(-6px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0efeb]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
              {messageTarget.postedBy[0]}
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#1c1c1e]">Message to {messageTarget.postedBy}</p>
              <p className="text-[12px] text-[#9ca3af]">{messageTarget.name}</p>
            </div>
          </div>
          <button onClick={() => setMessageTarget(null)} className="w-8 h-8 rounded-full bg-[#f5f4f0] flex items-center justify-center text-[#6c6a66] hover:bg-[#ebe9e4] transition-colors text-[18px] leading-none font-light">×</button>
        </div>
        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">Your message — feel free to edit</p>
          <textarea
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            rows={5}
            autoFocus
            className="w-full border border-[#e8e7e3] rounded-xl px-4 py-3 text-[13px] text-[#1c1c1e] resize-none focus:outline-none focus:border-[#1c1c1e] leading-relaxed bg-[#fafaf9]"
          />
        </div>
        {/* Footer */}
        <div className="flex gap-2 px-6 pb-5">
          <button onClick={() => setMessageTarget(null)} className="px-5 h-10 rounded-xl border border-[#e8e7e3] text-[13px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] transition-colors">
            Cancel
          </button>
          <button onClick={onSend} className="flex-1 h-10 rounded-xl bg-[#1c1c1e] text-white text-[13px] font-bold hover:bg-[#2d2d2d] transition-colors">
            Send & Go to Messages →
          </button>
        </div>
      </div>
    </div>
  )

  // ── Sublease detail view ─────────────────────────────────────────────────
  if (localSubleaseId) {
    const s = subleaseListings.find(l => l.id === localSubleaseId)!
    const disc = discountPct(s.price, s.marketRate)
    const urgColor = s.daysUntilLeave <= 7 ? 'text-red-600 bg-red-50' : s.daysUntilLeave <= 21 ? 'text-orange-600 bg-orange-50' : 'text-[#6c6a66] bg-[#f5f4f0]'
    const typeLabel = s.type === 'sublease' ? '🔄 转租' : s.type === 'transfer' ? '📋 转让' : '🏠 合租'
    const aboutTexts: Record<number, string> = {
      101: "CS大三，暑假回国实习，把Green St精装修工作室以低于市价$330转租。家具齐全，网+水电全含，拎包即住。楼下就是最热闹的Green St餐厅街，步行5分钟到Siebel。",
      102: "暑假回家，把Chalmers的1BR出租。采光非常好，楼内有洗衣机，楼下有停车位，附近就是Engineering区。家具不含，但价格低于市价$350，性价比很高。",
      103: "秋季exchange出国，整栋2BR靠近Main Quad转让。家具齐全，可以找朋友合住分摊。楼顶有天台休息区和健身房，学术氛围好，适合图书馆党。",
      104: "紧急！实习offer突然来了，First St精装修Studio必须马上找人。家具电器全含，$510/mo全包，价格极低，先到先得。",
      105: "12月毕业，接盘我在South Campus的1BR，租到明年7月底。附近安静，适合研究生或专注学习的同学。可续签，房东人好。",
    }
    return (
      <div className="flex flex-1 overflow-hidden bg-white" style={{ animation: 'slideInDetail 0.2s cubic-bezier(0.4,0,0.2,1)' }}>
        <style>{`@keyframes slideInDetail { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }`}</style>
        <div className="flex flex-col w-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0efeb] flex-shrink-0">
            <button onClick={() => setLocalSubleaseId(null)} className="flex items-center gap-2 text-[#6c6a66] hover:text-[#1c1c1e] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span className="text-[13px] font-semibold">返回列表</span>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${s.badgeColor}`}>{typeLabel}</span>
              {s.daysUntilLeave <= 21 && <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${urgColor}`}>{s.daysUntilLeave}d left</span>}
            </div>
          </div>

          {/* Photo */}
          <div className="relative h-[240px] flex-shrink-0">
            <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <div className="flex items-baseline gap-2 mb-1">
                <p className="text-[28px] font-black text-white leading-none">${s.price}<span className="text-[13px] font-normal text-white/60">/mo</span></p>
                <span className="text-[13px] font-semibold text-white/50 line-through">${s.marketRate}</span>
                <span className="text-[13px] font-black text-green-300">-{disc}%</span>
              </div>
              <p className="text-[11px] text-green-300 font-bold">省 ${s.marketRate - s.price}/mo · 比市场价低{disc}%</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5 max-w-2xl">
            <div>
              <h1 className="text-[22px] font-black text-[#1c1c1e] leading-tight mb-1">{s.name}</h1>
              <p className="text-[13px] text-[#9ca3af]">{s.address}</p>
            </div>

            {/* Date range — most important info */}
            <div className="flex items-center gap-3 p-4 bg-[#f5f4f0] rounded-2xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <p className="text-[15px] font-black text-[#1c1c1e]">{fmtDate(s.availableFrom)} → {fmtDate(s.availableTo)}</p>
                <p className="text-[11px] text-[#9ca3af] mt-0.5">
                  {s.type === 'transfer' && s.leaseEnds ? `合同到期：${fmtDate(s.leaseEnds)}${s.renewalPossible ? ' · 可续签' : ' · 不可续签'}` : ''}
                  {s.type === 'roomshare' && s.totalRooms ? `${s.totalRooms}居室，当前住有室友` : ''}
                  {s.type === 'sublease' ? '临时转租，原房东暑期返回' : ''}
                </p>
              </div>
            </div>

            {/* Via + Utilities */}
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex flex-col gap-1 px-4 py-3 rounded-2xl border ${s.via === 'individual' ? 'bg-blue-50 border-blue-100' : 'bg-purple-50 border-purple-100'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">发布方式</span>
                <span className="text-[13px] font-bold">{s.via === 'individual' ? '👤 个人直发' : '🏢 平台挂牌'}</span>
                <span className="text-[10px] text-[#9ca3af] leading-tight">{s.via === 'individual' ? '无中介费，直联房主' : '合同有保障，平台背书'}</span>
              </div>
              <div className={`flex flex-col gap-1 px-4 py-3 rounded-2xl border ${s.utilitiesIncluded ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af]">水电费</span>
                <span className="text-[13px] font-bold">{s.utilitiesIncluded ? '✅ 全含' : '⚡ 部分自付'}</span>
                <span className="text-[10px] text-[#9ca3af] leading-tight">{s.utilitiesNote}</span>
              </div>
            </div>

            {/* Specs */}
            <div className="flex gap-4 py-4 border-y border-[#f0efeb]">
              {[
                { label: '房型', val: s.beds },
                { label: '面积', val: s.sqft },
                { label: '装修', val: s.furnished ? '含家具' : '不含家具' },
              ].map((item, i) => (
                <div key={i} className={`flex flex-col gap-0.5 ${i > 0 ? 'pl-4 border-l border-[#f0efeb]' : ''}`}>
                  <span className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider">{item.label}</span>
                  <span className="text-[14px] font-bold text-[#1c1c1e]">{item.val}</span>
                </div>
              ))}
            </div>

            {/* About */}
            <div>
              <h3 className="text-[14px] font-bold text-[#1c1c1e] mb-2">房主说</h3>
              <p className="text-[13px] text-[#6c6a66] leading-relaxed">{aboutTexts[s.id]}</p>
            </div>

            {/* Poster */}
            <div className="flex items-center gap-4 p-4 bg-[#f5f4f0] rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-[16px] font-bold flex-shrink-0">{s.postedBy[0]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#1c1c1e]">{s.postedBy}</p>
                <p className="text-[11px] text-[#9ca3af]">UIUC 在读学生 · 个人发布</p>
              </div>
              <button
                onClick={() => {
                  const tmpl = `Hi ${s.postedBy.split(' ')[0]}! 我对你在 ${s.address} 的房源感兴趣（${fmtDate(s.availableFrom)}–${fmtDate(s.availableTo)}，$${s.price}/mo）。方便详聊吗？`
                  setMessageText(tmpl)
                  setMessageTarget({ id: s.id, type: s.type, name: s.name, address: s.address, price: s.price, marketRate: s.marketRate, via: s.via, utilitiesIncluded: s.utilitiesIncluded, img: s.img, beds: s.beds, sqft: s.sqft, availableFrom: s.availableFrom, availableTo: s.availableTo, badge: s.badge, badgeColor: s.badgeColor, listingId: s.listingId, daysUntilLeave: s.daysUntilLeave, postedBy: s.postedBy, furnished: s.furnished })
                }}
                className="flex-shrink-0 px-4 py-2 bg-[#1c1c1e] text-white rounded-xl text-[12px] font-bold"
              >联系 →</button>
            </div>
          </div>
        </div>

        {renderMessageModal(() => { setMessageTarget(null); setLocalSubleaseId(null); onNavigate?.('messages'); })}
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 overflow-hidden">
      {renderMessageModal(() => { setMessageTarget(null); onNavigate?.('messages'); })}

      {/* Left panel */}
      <div className={`flex-shrink-0 flex flex-col bg-white border-r border-[#e5e4e0] overflow-hidden transition-all duration-200 ${panelCollapsed ? 'w-10' : 'w-80'}`}>

        {/* Collapse toggle */}
        <div className={`flex-shrink-0 border-b border-[#f0efeb] flex ${panelCollapsed ? 'justify-center px-2 py-3' : 'justify-end px-4 py-3'}`}>
          <button
            onClick={() => setPanelCollapsed(c => {
              const next = !c;
              // next=false means panel is now open (filter visible)
              if (!next) window.location.hash = mode === 'sublease' ? 'explore/sublease/filter' : 'explore/filter';
              else window.location.hash = mode === 'sublease' ? 'explore/sublease' : 'explore';
              return next;
            })}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {panelCollapsed
                ? <><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></>
                : <><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></>}
            </svg>
          </button>
        </div>

        {!panelCollapsed && <>
          {/* Scrollable filter area */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-3 space-y-5 border-b border-[#f0efeb]">

            {/* Rent / Sublease toggle */}
            <div className="flex bg-[#f5f4f0] rounded-xl p-1 gap-1">
              {(['rent', 'sublease'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); window.location.hash = m === 'sublease' ? 'explore/sublease' : 'explore'; }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all capitalize ${mode === m ? 'bg-[#1c1c1e] text-white shadow-sm' : 'text-[#6c6a66] hover:text-[#1c1c1e]'}`}
                >
                  {m === 'rent' ? 'Rent' : 'Sublease'}
                </button>
              ))}
            </div>

            {mode === 'rent' ? (
              /* ── RENT FILTERS ───────────────────────────────────── */
              <>
                {/* Type of place */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-bold text-[#1c1c1e]">Type of place</p>
                    <button className="text-[11px] font-semibold text-[#6c6a66] hover:text-[#1c1c1e]">See All</button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {placeTypes.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setPlaceType(t.id)}
                        className={`flex flex-col items-start gap-2 px-3 py-3 rounded-xl border-2 transition-all text-left ${
                          placeType === t.id
                            ? 'border-[#1c1c1e] bg-[#f5f4f0] text-[#1c1c1e]'
                            : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#c0bfbb] hover:text-[#1c1c1e]'
                        }`}
                      >
                        {t.icon}
                        <span className="text-[12px] font-semibold leading-none">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rental Price */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-[#1c1c1e]">Rental Price</p>
                    <span className="text-[11px] font-medium text-[#9ca3af]">Monthly</span>
                  </div>
                  {/* Dual-range slider — MIN gets higher z-index when near MAX */}
                  <div className="relative h-1.5 bg-[#e8e7e3] rounded-full mb-4 mx-1">
                    <div className="absolute h-full bg-[#1c1c1e] rounded-full" style={{ left: `${((priceMin - 500) / 700) * 100}%`, right: `${100 - ((priceMax - 500) / 700) * 100}%` }} />
                    <input type="range" min={500} max={1200} step={25} value={priceMin}
                      onChange={e => { const v = Math.min(Number(e.target.value), priceMax - 50); setPriceMin(v); setMinInput(String(v)) }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: ((priceMax - priceMin) / 700) < 0.15 ? 5 : 2 }} />
                    <input type="range" min={500} max={1200} step={25} value={priceMax}
                      onChange={e => { const v = Math.max(Number(e.target.value), priceMin + 50); setPriceMax(v); setMaxInput(String(v)) }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: ((priceMax - priceMin) / 700) < 0.15 ? 2 : 3 }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1c1c1e] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${((priceMin - 500) / 700) * 100}% - 8px)` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1c1c1e] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${((priceMax - 500) / 700) * 100}% - 8px)` }} />
                  </div>
                  {/* Editable MIN / MAX inputs */}
                  <div className="flex gap-2">
                    <label className="flex-1 border border-[#e8e7e3] rounded-2xl px-3 py-2.5 cursor-text focus-within:border-[#1c1c1e] transition-colors">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider leading-none mb-1">Min</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[13px] font-bold text-[#9ca3af]">$</span>
                        <input
                          type="number" min={500} max={priceMax - 50} step={25}
                          value={minInput}
                          onChange={e => {
                            setMinInput(e.target.value)
                            if (minDebounce.current) clearTimeout(minDebounce.current)
                            minDebounce.current = setTimeout(() => {
                              const v = Math.min(Math.max(parseInt(e.target.value) || 500, 500), priceMax - 50)
                              setPriceMin(v); setMinInput(String(v))
                            }, 350)
                          }}
                          onBlur={() => {
                            if (minDebounce.current) clearTimeout(minDebounce.current)
                            const v = Math.min(Math.max(parseInt(minInput) || 500, 500), priceMax - 50)
                            setPriceMin(v); setMinInput(String(v))
                          }}
                          className="w-full text-[14px] font-bold text-[#1c1c1e] bg-transparent outline-none leading-none"
                        />
                      </div>
                    </label>
                    <label className="flex-1 border-2 border-[#1c1c1e] rounded-2xl px-3 py-2.5 cursor-text focus-within:border-[#1c1c1e] transition-colors">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider leading-none mb-1">Max</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[13px] font-bold text-[#9ca3af]">$</span>
                        <input
                          type="number" min={priceMin + 50} max={2000} step={25}
                          value={maxInput}
                          onChange={e => {
                            setMaxInput(e.target.value)
                            if (maxDebounce.current) clearTimeout(maxDebounce.current)
                            maxDebounce.current = setTimeout(() => {
                              const v = Math.max(Math.min(parseInt(e.target.value) || 1100, 2000), priceMin + 50)
                              setPriceMax(v); setMaxInput(String(v))
                            }, 350)
                          }}
                          onBlur={() => {
                            if (maxDebounce.current) clearTimeout(maxDebounce.current)
                            const v = Math.max(Math.min(parseInt(maxInput) || 1100, 2000), priceMin + 50)
                            setPriceMax(v); setMaxInput(String(v))
                          }}
                          className="w-full text-[14px] font-bold text-[#1c1c1e] bg-transparent outline-none leading-none"
                        />
                      </div>
                    </label>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] text-right">→ <span className="font-semibold text-[#1c1c1e]">{filtered.length}</span> listing{filtered.length !== 1 ? 's' : ''} match</p>
                </div>

                {/* Area */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-[#1c1c1e]">Area</p>
                    <span className="text-[11px] font-medium text-[#9ca3af] flex items-center gap-0.5">Neighborhood <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setSelectedArea('')} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${!selectedArea ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>All</button>
                    {areas.map(a => (
                      <button key={a.id} onClick={() => setSelectedArea(selectedArea === a.id ? '' : a.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${selectedArea === a.id ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : `${a.color} ${a.textColor} border-transparent hover:border-current`}`}>{a.emoji} {a.label}</button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">Bedrooms</p>
                  <div className="flex gap-2 flex-wrap">
                    {bedroomOptions.map(b => (
                      <button key={b} onClick={() => setSelectedBed(selectedBed === b ? '' : b)} className={`h-10 min-w-[40px] px-2 rounded-full text-[12px] font-bold border-2 transition-all ${selectedBed === b ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{b}</button>
                    ))}
                  </div>
                </div>

                {/* Floors */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">Floors</p>
                  <div className="flex gap-2 flex-wrap">
                    {floorOptions.map(f => (
                      <button key={f} onClick={() => setSelectedFloor(selectedFloor === f ? '' : f)} className={`w-10 h-10 rounded-full text-[12px] font-bold border-2 transition-all ${selectedFloor === f ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{f}</button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">Amenities</p>
                  <div className="space-y-4">
                    {amenityOptions.map(a => (
                      <div key={a.key} className="flex items-center justify-between">
                        <span className="text-[13px] text-[#1c1c1e]">{a.label}</span>
                        <button onClick={() => toggleAmenity(a.key)} className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${amenities.has(a.key) ? 'bg-[#1c1c1e]' : 'bg-[#e5e4e0]'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${amenities.has(a.key) ? 'translate-x-7' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              /* ── SUBLEASE FILTERS ───────────────────────────────── */
              <>
                {/* Type */}
                <div>
                  <p className="text-xs font-bold text-[#1c1c1e] mb-2.5">类型</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {subleaseTypeOptions.map(t => {
                      const count = t.id === 'all' ? subleaseListings.length : subleaseListings.filter(s => s.type === t.id).length
                      const isActive = subleaseType === t.id
                      return (
                        <button key={t.id} onClick={() => setSubleaseType(t.id)}
                          className={`flex flex-col items-start px-3 py-2.5 rounded-xl border-2 transition-all text-left ${isActive ? 'border-[#1c1c1e] bg-[#1c1c1e] text-white' : 'border-[#e8e7e3] hover:border-[#c0bfbb]'}`}
                        >
                          <span className={`text-[12px] font-bold leading-tight ${isActive ? 'text-white' : 'text-[#1c1c1e]'}`}>{t.label}</span>
                          <span className={`text-[9px] mt-0.5 leading-tight ${isActive ? 'text-white/60' : 'text-[#9ca3af]'}`}>{t.desc} · {count}个</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Date range */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-bold text-[#1c1c1e]">日期区间</p>
                    {(dateFrom || dateTo) && (
                      <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-[10px] text-[#9ca3af] hover:text-[#1c1c1e] transition-colors">清除</button>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="flex flex-col border border-[#e8e7e3] rounded-xl px-3 py-2 focus-within:border-[#1c1c1e] transition-colors cursor-text">
                      <span className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-wider leading-none mb-1">入住日</span>
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="text-[12px] font-bold text-[#1c1c1e] bg-transparent outline-none" />
                    </label>
                    <label className="flex flex-col border border-[#e8e7e3] rounded-xl px-3 py-2 focus-within:border-[#1c1c1e] transition-colors cursor-text">
                      <span className="text-[9px] text-[#9ca3af] font-bold uppercase tracking-wider leading-none mb-1">退租日</span>
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="text-[12px] font-bold text-[#1c1c1e] bg-transparent outline-none" />
                    </label>
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <p className="text-xs font-bold text-[#1c1c1e] mb-2.5">最低折扣</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {[null, 10, 20, 30].map(d => (
                      <button key={d ?? 0} onClick={() => setMinDiscount(minDiscount === d ? null : d)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border-2 transition-all ${minDiscount === d ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#c0bfbb]'}`}
                      >
                        {d === null ? '不限' : `≥${d}% off`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Urgency */}
                <div>
                  <p className="text-xs font-bold text-[#1c1c1e] mb-2.5">紧迫程度</p>
                  <div className="flex flex-col gap-1.5">
                    {([
                      { key: null,       label: '不限',    sub: '全部显示' },
                      { key: 'urgent',   label: '🔴 紧急', sub: '≤7天出发，议价空间大' },
                      { key: 'soon',     label: '🟡 近期', sub: '1–3周内出发' },
                      { key: 'relaxed',  label: '🟢 充裕', sub: '1个月以上' },
                    ] as const).map(opt => (
                      <button key={opt.key ?? 'null'} onClick={() => setUrgencyFilter(urgencyFilter === opt.key ? null : opt.key)}
                        className={`flex items-center justify-between py-2 px-3 rounded-xl border-2 text-left transition-all ${urgencyFilter === opt.key ? 'border-[#1c1c1e] bg-[#1c1c1e]' : 'border-[#e8e7e3] hover:border-[#c0bfbb]'}`}
                      >
                        <div>
                          <span className={`text-[12px] font-bold block leading-tight ${urgencyFilter === opt.key ? 'text-white' : 'text-[#1c1c1e]'}`}>{opt.label}</span>
                          <span className={`text-[10px] ${urgencyFilter === opt.key ? 'text-white/60' : 'text-[#9ca3af]'}`}>{opt.sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-[#1c1c1e]">月租范围</p>
                    <span className="text-[11px] text-[#9ca3af]">{filteredSubleases.length} 个匹配</span>
                  </div>
                  <div className="relative h-1.5 bg-[#e8e7e3] rounded-full mb-4 mx-1">
                    <div className="absolute h-full bg-[#1c1c1e] rounded-full" style={{ left: `${((subleasePriceMin - 400) / 800) * 100}%`, right: `${100 - ((subleasePriceMax - 400) / 800) * 100}%` }} />
                    <input type="range" min={400} max={1200} step={25} value={subleasePriceMin}
                      onChange={e => { const v = Math.min(Number(e.target.value), subleasePriceMax - 50); setSubleasePriceMin(v); setSubMinInput(String(v)) }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: ((subleasePriceMax - subleasePriceMin) / 800) < 0.15 ? 5 : 2 }} />
                    <input type="range" min={400} max={1200} step={25} value={subleasePriceMax}
                      onChange={e => { const v = Math.max(Number(e.target.value), subleasePriceMin + 50); setSubleasePriceMax(v); setSubMaxInput(String(v)) }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: ((subleasePriceMax - subleasePriceMin) / 800) < 0.15 ? 2 : 3 }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1c1c1e] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${((subleasePriceMin - 400) / 800) * 100}% - 8px)` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1c1c1e] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${((subleasePriceMax - 400) / 800) * 100}% - 8px)` }} />
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1 border border-[#e8e7e3] rounded-2xl px-3 py-2.5 cursor-text focus-within:border-[#1c1c1e] transition-colors">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider leading-none mb-1">Min</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[13px] font-bold text-[#9ca3af]">$</span>
                        <input type="number" min={400} max={subleasePriceMax - 50} step={25} value={subMinInput}
                          onChange={e => { setSubMinInput(e.target.value); if (subMinDebounce.current) clearTimeout(subMinDebounce.current); subMinDebounce.current = setTimeout(() => { const v = Math.min(Math.max(parseInt(e.target.value)||400,400),subleasePriceMax-50); setSubleasePriceMin(v); setSubMinInput(String(v)) }, 350) }}
                          onBlur={() => { if (subMinDebounce.current) clearTimeout(subMinDebounce.current); const v = Math.min(Math.max(parseInt(subMinInput)||400,400),subleasePriceMax-50); setSubleasePriceMin(v); setSubMinInput(String(v)) }}
                          className="w-full text-[14px] font-bold text-[#1c1c1e] bg-transparent outline-none leading-none" />
                      </div>
                    </label>
                    <label className="flex-1 border-2 border-[#1c1c1e] rounded-2xl px-3 py-2.5 cursor-text">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider leading-none mb-1">Max</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[13px] font-bold text-[#9ca3af]">$</span>
                        <input type="number" min={subleasePriceMin + 50} max={1200} step={25} value={subMaxInput}
                          onChange={e => { setSubMaxInput(e.target.value); if (subMaxDebounce.current) clearTimeout(subMaxDebounce.current); subMaxDebounce.current = setTimeout(() => { const v = Math.max(Math.min(parseInt(e.target.value)||1200,1200),subleasePriceMin+50); setSubleasePriceMax(v); setSubMaxInput(String(v)) }, 350) }}
                          onBlur={() => { if (subMaxDebounce.current) clearTimeout(subMaxDebounce.current); const v = Math.max(Math.min(parseInt(subMaxInput)||1200,1200),subleasePriceMin+50); setSubleasePriceMax(v); setSubMaxInput(String(v)) }}
                          className="w-full text-[14px] font-bold text-[#1c1c1e] bg-transparent outline-none leading-none" />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Area */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">区域</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setSubleaseArea('')} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${!subleaseArea ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e]'}`}>全部</button>
                    {areas.map(a => (
                      <button key={a.id} onClick={() => setSubleaseArea(subleaseArea === a.id ? '' : a.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${subleaseArea === a.id ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : `${a.color} ${a.textColor} border-transparent hover:border-current`}`}>{a.emoji} {a.label}</button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">房型</p>
                  <div className="flex gap-2 flex-wrap">
                    {['Studio', '1', '2', '3+'].map(b => (
                      <button key={b} onClick={() => setSubleaseBed(subleaseBed === b ? '' : b)} className={`h-9 min-w-[40px] px-2 rounded-full text-[12px] font-bold border-2 transition-all ${subleaseBed === b ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e]'}`}>{b}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </>}
      </div>

      {/* Right: map */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Map3DView
          selectedCollege={profile.college}
          profile={profile}
          onViewListing={(id) => _onViewListing(id)}
          onReset={() => {}}
          mode={mode}
          subleasePins={subleasePinsForMap}
          highlightPinId={highlightPinId}
          onMessagePoster={(pin) => {
            const tmpl = `Hi ${pin.postedBy.split(' ')[0]}! 我对你在 ${pin.address} 的房源感兴趣（${fmtDate(pin.availableFrom)}–${fmtDate(pin.availableTo)}，$${pin.price}/mo）。方便详聊吗？`
            setMessageText(tmpl)
            setMessageTarget(pin)
          }}
          filteredIds={mode === 'rent' ? filtered.map(l => l.id) : undefined}
          savedIds={savedIds}
          onToggleSave={onToggleSave}
          onViewSubleaseDetail={(id) => setLocalSubleaseId(id)}
          onPinSelect={(id) => {
            if (id) window.location.hash = mode === 'sublease' ? `explore/sublease/${id}` : `explore/${id}`;
            else window.location.hash = mode === 'sublease' ? 'explore/sublease' : 'explore';
          }}
        />
      </div>
    </div>
  )
}
