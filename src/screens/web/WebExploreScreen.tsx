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
  { key: 'pet', label: 'Pets allowed' },
  { key: 'parking', label: 'Parking slot' },
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
interface SubleaseItem {
  id: number
  name: string
  address: string
  price: number
  beds: string
  sqft: string
  img: string
  badge: string
  badgeColor: string
  period: 'Summer 2025' | 'Fall 2025' | 'Spring 2026'
  available: string
  postedBy: string
  daysLeft: number
  duration: number   // months
  furnished: boolean
  area: string
  listingId: number  // maps to listingCoords key in Map3DView
}

const subleaseListings: SubleaseItem[] = [
  {
    id: 101,
    name: 'Green St Studio Sublet',
    address: '302 E Green St, Champaign',
    price: 620,
    beds: 'Studio',
    sqft: '490 sqft',
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
    badge: 'Sublease',
    badgeColor: 'bg-orange-100 text-orange-700',
    period: 'Summer 2025',
    available: 'May 1 – Aug 15',
    postedBy: 'Sarah K.',
    daysLeft: 12,
    duration: 3,
    furnished: true,
    area: 'green',
    listingId: 3,
  },
  {
    id: 102,
    name: '1BR Chalmers Sublet',
    address: '508 E Chalmers, Champaign',
    price: 750,
    beds: '1B1B',
    sqft: '650 sqft',
    img: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?w=400&q=80',
    badge: 'Sublease',
    badgeColor: 'bg-orange-100 text-orange-700',
    period: 'Summer 2025',
    available: 'Jun 1 – Aug 31',
    postedBy: 'Mike T.',
    daysLeft: 28,
    duration: 3,
    furnished: false,
    area: 'chalmers',
    listingId: 6,
  },
  {
    id: 103,
    name: 'Main Quad 2BR Sublet',
    address: '410 W Clark St, Champaign',
    price: 880,
    beds: '2B1B',
    sqft: '820 sqft',
    img: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
    badge: 'Sublease',
    badgeColor: 'bg-orange-100 text-orange-700',
    period: 'Fall 2025',
    available: 'Aug 15 – Dec 15',
    postedBy: 'Emma L.',
    daysLeft: 60,
    duration: 4,
    furnished: true,
    area: 'quad',
    listingId: 4,
  },
  {
    id: 104,
    name: 'First St Studio Sublet',
    address: '1011 S First St, Champaign',
    price: 510,
    beds: 'Studio',
    sqft: '380 sqft',
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80',
    badge: 'Urgent',
    badgeColor: 'bg-[#1c1c1e] text-white',
    period: 'Summer 2025',
    available: 'May 15 – Jul 31',
    postedBy: 'Alex R.',
    daysLeft: 5,
    duration: 2,
    furnished: true,
    area: 'first',
    listingId: 1,
  },
  {
    id: 105,
    name: 'South Campus 1BR Sublet',
    address: '901 S Lincoln Ave, Urbana',
    price: 690,
    beds: '1B1B',
    sqft: '580 sqft',
    img: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=80',
    badge: 'Sublease',
    badgeColor: 'bg-orange-100 text-orange-700',
    period: 'Spring 2026',
    available: 'Jan 10 – May 10',
    postedBy: 'Jessica P.',
    daysLeft: 90,
    duration: 4,
    furnished: false,
    area: 'south',
    listingId: 8,
  },
]

const semesterOptions = [
  { label: 'Summer 2025', dates: 'May 1 – Aug 15, 2025', emoji: '☀️', duration: '3.5 months' },
  { label: 'Fall 2025',   dates: 'Aug 16 – Dec 15, 2025', emoji: '🍂', duration: '4 months' },
  { label: 'Spring 2026', dates: 'Jan 10 – May 10, 2026', emoji: '❄️', duration: '4 months' },
] as const
const durationOptions = [
  { label: '1 mo', months: 1 },
  { label: '2 mo', months: 2 },
  { label: '3 mo', months: 3 },
  { label: 'Full sem', months: 4 },
]

export default function WebExploreScreen({ onViewListing: _onViewListing, onNavigate, initialListingId, initialSubleaseId, savedIds: savedIdsProp, onToggleSave }: Props) {
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null)
  const [furnishedOnly, setFurnishedOnly] = useState(false)
  const [subleaseBed, setSubleaseBed] = useState<string>('')
  const [subleaseArea, setSubleaseArea] = useState<string>('')
  const [subleasePriceMin, setSubleasePriceMin] = useState(400)
  const [subleasePriceMax, setSubleasePriceMax] = useState(900)
  const [subMinInput, setSubMinInput] = useState('400')
  const [subMaxInput, setSubMaxInput] = useState('900')
  const subMinDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subMaxDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [localSavedIds, setLocalSavedIds] = useState<Set<number>>(new Set())
  const savedIds = savedIdsProp ?? localSavedIds
  const [highlightPinId, setHighlightPinId] = useState<number | null>(initialSubleaseId ?? initialListingId ?? null)
  const [localSubleaseId, setLocalSubleaseId] = useState<number | null>(null)
  const [messageTarget, setMessageTarget] = useState<SubleasePin | null>(null)
  const [messageText, setMessageText] = useState('')

  const toggleSaved = (id: number) => {
    if (onToggleSave) { onToggleSave(id); return; }
    setLocalSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const toggleAmenity = (k: string) => setAmenities(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })

  // Rent filter logic
  const filtered = listings.filter(l => {
    if (placeType === 'studio' && !l.beds.toLowerCase().includes('studio')) return false
    if (placeType === 'house') return false
    if (placeType === 'room') return false
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
    if (selectedPeriod && s.period !== (selectedPeriod as string)) return false
    if (subleaseArea && s.area !== subleaseArea) return false
    if (subleaseBed) {
      if (subleaseBed === 'Studio' && s.beds !== 'Studio') return false
      if (subleaseBed !== 'Studio' && !s.beds.startsWith(subleaseBed + 'B')) return false
    }
    if (selectedDuration && s.duration < selectedDuration) return false
    if (furnishedOnly && !s.furnished) return false
    if (s.price < subleasePriceMin || s.price > subleasePriceMax) return false
    return true
  })

  // Memoize so Map3DView's subleasePins useEffect doesn't reset selectedId on every render
  const subleasePinsForMap = useMemo<SubleasePin[]>(() => filteredSubleases.map(s => ({
    id: s.id, name: s.name, address: s.address, price: s.price, img: s.img,
    beds: s.beds, sqft: s.sqft, available: s.available, period: s.period,
    badge: s.badge, badgeColor: s.badgeColor, listingId: s.listingId,
    daysLeft: s.daysLeft, postedBy: s.postedBy, furnished: s.furnished,
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
    const aboutTexts: Record<number, string> = {
      101: "I'm a CS junior subleasing my furnished studio for the summer. Everything is included — furniture, kitchen appliances, fast WiFi, and AC. Located right on Green St, super walkable to campus and the best restaurants.",
      102: "Going home for the summer and need someone to take over my 1BR in Chalmers. Clean, well-maintained, great natural light. Not furnished but landlord is flexible and building has on-site laundry.",
      103: "Study abroad this fall — my 2BR near the Quad needs a sublettor. Furnished with two bedrooms so could split cost with a friend. Building has a rooftop lounge and gym.",
      104: "Urgent! Internship came up last minute. Studio on First St, fully furnished and move-in ready. Super affordable at $510/mo — first come first served.",
      105: "Graduating in December, looking for someone to take over my lease starting January. 1BR near South Campus, quiet neighborhood, great for grad students.",
    }
    return (
      <div className="flex flex-1 overflow-hidden bg-white" style={{ animation: 'slideInDetail 0.2s cubic-bezier(0.4,0,0.2,1)' }}>
        <style>{`@keyframes slideInDetail { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }`}</style>
        <div className="flex flex-col w-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0efeb] flex-shrink-0">
            <button onClick={() => setLocalSubleaseId(null)} className="flex items-center gap-2 text-[#6c6a66] hover:text-[#1c1c1e] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              <span className="text-[13px] font-semibold">Back to listings</span>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
              {s.daysLeft <= 7 && <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-[#f5f4f0] text-[#1c1c1e]">{s.daysLeft}d left</span>}
            </div>
          </div>

          {/* Photo */}
          <div className="relative h-[260px] flex-shrink-0">
            <img src={s.img} alt={s.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6">
              <p className="text-[28px] font-black text-white leading-none">${s.price}<span className="text-[14px] font-normal text-white/60">/mo</span></p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 space-y-5 max-w-2xl">
            {/* Title + dates */}
            <div>
              <h1 className="text-[22px] font-black text-[#1c1c1e] leading-tight mb-1">{s.name}</h1>
              <p className="text-[13px] text-[#9ca3af]">{s.address}</p>
            </div>

            {/* Period + dates pill row */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-[#f5f4f0] px-4 py-2.5 rounded-2xl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <span className="text-[13px] font-bold text-[#1c1c1e]">{s.available}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#f5f4f0] px-4 py-2.5 rounded-2xl">
                <span className="text-[13px]">{s.period.startsWith('Summer') ? '☀️' : s.period.startsWith('Fall') ? '🍂' : '❄️'}</span>
                <span className="text-[13px] font-bold text-[#1c1c1e]">{s.period}</span>
              </div>
              {s.furnished && (
                <div className="flex items-center gap-1.5 bg-[#f5f4f0] px-4 py-2.5 rounded-2xl">
                  <span className="text-[13px] font-bold text-[#1c1c1e]">Furnished</span>
                </div>
              )}
            </div>

            {/* Specs */}
            <div className="flex gap-4 py-4 border-y border-[#f0efeb]">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider">Bedrooms</span>
                <span className="text-[15px] font-bold text-[#1c1c1e]">{s.beds}</span>
              </div>
              <div className="w-px bg-[#f0efeb]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider">Size</span>
                <span className="text-[15px] font-bold text-[#1c1c1e]">{s.sqft}</span>
              </div>
              <div className="w-px bg-[#f0efeb]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider">Duration</span>
                <span className="text-[15px] font-bold text-[#1c1c1e]">{s.duration} mo</span>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="text-[14px] font-bold text-[#1c1c1e] mb-2">About this sublease</h3>
              <p className="text-[13px] text-[#6c6a66] leading-relaxed">{aboutTexts[s.id]}</p>
            </div>

            {/* Poster card */}
            <div className="flex items-center gap-4 p-4 bg-[#f5f4f0] rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-[16px] font-bold flex-shrink-0">
                {s.postedBy[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[#1c1c1e]">{s.postedBy}</p>
                <p className="text-[11px] text-[#9ca3af]">UIUC Student · Posted this sublease</p>
              </div>
              <button
                onClick={() => {
                  const tmpl = `Hi ${s.postedBy.split(' ')[0]}! I'm interested in your sublease at ${s.address} for ${s.period} (${s.available}, $${s.price}/mo). Could you share more details? I'm a UIUC student and this fits my schedule perfectly.`
                  setMessageText(tmpl)
                  setMessageTarget({ id: s.id, name: s.name, address: s.address, price: s.price, img: s.img, beds: s.beds, sqft: s.sqft, available: s.available, period: s.period, badge: s.badge, badgeColor: s.badgeColor, listingId: s.listingId, daysLeft: s.daysLeft, postedBy: s.postedBy, furnished: s.furnished })
                }}
                className="flex-shrink-0 px-4 py-2 bg-[#1c1c1e] text-white rounded-xl text-[12px] font-bold"
              >
                Message →
              </button>
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
                {/* Semester / Period */}
                <div>
                  <p className="text-xs font-bold text-[#1c1c1e] mb-2.5">Semester / Period</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setSelectedPeriod('')}
                      className={`w-full py-2.5 px-3 rounded-xl text-[12px] font-bold border-2 text-left transition-all ${!selectedPeriod ? 'border-[#1c1c1e] bg-[#1c1c1e] text-white' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#c0bfbb]'}`}
                    >All semesters</button>
                    {semesterOptions.map(s => {
                      const count = subleaseListings.filter(l => l.period === s.label).length
                      const isActive = selectedPeriod === s.label
                      return (
                        <button
                          key={s.label}
                          onClick={() => setSelectedPeriod(isActive ? '' : s.label)}
                          className={`w-full py-2.5 px-3 rounded-xl border-2 flex items-center justify-between transition-all text-left ${isActive ? 'border-[#1c1c1e] bg-[#1c1c1e] text-white' : 'border-[#e8e7e3] hover:border-[#c0bfbb]'}`}
                        >
                          <div>
                            <div className={`text-[12px] font-bold leading-tight ${isActive ? 'text-white' : 'text-[#1c1c1e]'}`}>{s.emoji} {s.label}</div>
                            <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'text-white/70' : 'text-[#9ca3af]'}`}>{s.dates} · {s.duration}</div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 ${isActive ? 'bg-white/20 text-white' : 'bg-[#f5f4f0] text-[#6c6a66]'}`}>{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-[#1c1c1e]">Rental Price</p>
                    <span className="text-[11px] font-medium text-[#9ca3af]">Monthly</span>
                  </div>
                  {/* Dual-range slider */}
                  <div className="relative h-1.5 bg-[#e8e7e3] rounded-full mb-4 mx-1">
                    <div className="absolute h-full bg-[#1c1c1e] rounded-full" style={{ left: `${((subleasePriceMin - 400) / 700) * 100}%`, right: `${100 - ((subleasePriceMax - 400) / 700) * 100}%` }} />
                    <input type="range" min={400} max={1100} step={25} value={subleasePriceMin}
                      onChange={e => { const v = Math.min(Number(e.target.value), subleasePriceMax - 50); setSubleasePriceMin(v); setSubMinInput(String(v)) }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: ((subleasePriceMax - subleasePriceMin) / 700) < 0.15 ? 5 : 2 }} />
                    <input type="range" min={400} max={1100} step={25} value={subleasePriceMax}
                      onChange={e => { const v = Math.max(Number(e.target.value), subleasePriceMin + 50); setSubleasePriceMax(v); setSubMaxInput(String(v)) }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                      style={{ zIndex: ((subleasePriceMax - subleasePriceMin) / 700) < 0.15 ? 2 : 3 }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1c1c1e] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${((subleasePriceMin - 400) / 700) * 100}% - 8px)` }} />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#1c1c1e] rounded-full shadow-md pointer-events-none" style={{ left: `calc(${((subleasePriceMax - 400) / 700) * 100}% - 8px)` }} />
                  </div>
                  {/* Editable MIN / MAX inputs */}
                  <div className="flex gap-2">
                    <label className="flex-1 border border-[#e8e7e3] rounded-2xl px-3 py-2.5 cursor-text focus-within:border-[#1c1c1e] transition-colors">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider leading-none mb-1">Min</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[13px] font-bold text-[#9ca3af]">$</span>
                        <input type="number" min={400} max={subleasePriceMax - 50} step={25}
                          value={subMinInput}
                          onChange={e => {
                            setSubMinInput(e.target.value)
                            if (subMinDebounce.current) clearTimeout(subMinDebounce.current)
                            subMinDebounce.current = setTimeout(() => {
                              const v = Math.min(Math.max(parseInt(e.target.value) || 400, 400), subleasePriceMax - 50)
                              setSubleasePriceMin(v); setSubMinInput(String(v))
                            }, 350)
                          }}
                          onBlur={() => {
                            if (subMinDebounce.current) clearTimeout(subMinDebounce.current)
                            const v = Math.min(Math.max(parseInt(subMinInput) || 400, 400), subleasePriceMax - 50)
                            setSubleasePriceMin(v); setSubMinInput(String(v))
                          }}
                          className="w-full text-[14px] font-bold text-[#1c1c1e] bg-transparent outline-none leading-none"
                        />
                      </div>
                    </label>
                    <label className="flex-1 border-2 border-[#1c1c1e] rounded-2xl px-3 py-2.5 cursor-text focus-within:border-[#1c1c1e] transition-colors">
                      <p className="text-[10px] text-[#9ca3af] font-semibold uppercase tracking-wider leading-none mb-1">Max</p>
                      <div className="flex items-center gap-0.5">
                        <span className="text-[13px] font-bold text-[#9ca3af]">$</span>
                        <input type="number" min={subleasePriceMin + 50} max={1100} step={25}
                          value={subMaxInput}
                          onChange={e => {
                            setSubMaxInput(e.target.value)
                            if (subMaxDebounce.current) clearTimeout(subMaxDebounce.current)
                            subMaxDebounce.current = setTimeout(() => {
                              const v = Math.max(Math.min(parseInt(e.target.value) || 900, 1100), subleasePriceMin + 50)
                              setSubleasePriceMax(v); setSubMaxInput(String(v))
                            }, 350)
                          }}
                          onBlur={() => {
                            if (subMaxDebounce.current) clearTimeout(subMaxDebounce.current)
                            const v = Math.max(Math.min(parseInt(subMaxInput) || 900, 1100), subleasePriceMin + 50)
                            setSubleasePriceMax(v); setSubMaxInput(String(v))
                          }}
                          className="w-full text-[14px] font-bold text-[#1c1c1e] bg-transparent outline-none leading-none"
                        />
                      </div>
                    </label>
                  </div>
                  <p className="text-[11px] text-[#9ca3af] text-right mt-2">→ <span className="font-semibold text-[#1c1c1e]">{filteredSubleases.length}</span> sublease{filteredSubleases.length !== 1 ? 's' : ''} match</p>
                </div>

                {/* Area */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">Area</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setSubleaseArea('')} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${!subleaseArea ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>All</button>
                    {areas.map(a => (
                      <button key={a.id} onClick={() => setSubleaseArea(subleaseArea === a.id ? '' : a.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${subleaseArea === a.id ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : `${a.color} ${a.textColor} border-transparent hover:border-current`}`}>{a.emoji} {a.label}</button>
                    ))}
                  </div>
                </div>

                {/* Bedrooms */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">Bedrooms</p>
                  <div className="flex gap-2 flex-wrap">
                    {['Studio', '1', '2', '3+'].map(b => (
                      <button key={b} onClick={() => setSubleaseBed(subleaseBed === b ? '' : b)} className={`h-10 min-w-[40px] px-2 rounded-full text-[12px] font-bold border-2 transition-all ${subleaseBed === b ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{b}</button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e] mb-3">Min Duration</p>
                  <div className="flex gap-2 flex-wrap">
                    {durationOptions.map(d => (
                      <button key={d.months} onClick={() => setSelectedDuration(selectedDuration === d.months ? null : d.months)} className={`h-9 px-3 rounded-full text-[11px] font-bold border-2 transition-all ${selectedDuration === d.months ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e8e7e3] text-[#6c6a66] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{d.label}</button>
                    ))}
                  </div>
                </div>

                {/* Furnished */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1c1c1e]">Furnished only</p>
                    <p className="text-[11px] text-[#9ca3af] mt-0.5">Includes furniture & appliances</p>
                  </div>
                  <button onClick={() => setFurnishedOnly(f => !f)} className={`w-12 h-6 rounded-full relative transition-colors flex-shrink-0 ${furnishedOnly ? 'bg-[#1c1c1e]' : 'bg-[#e5e4e0]'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${furnishedOnly ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="hidden">

          {/* Listing cards */}
          <div className="flex-1 min-h-0 overflow-y-auto px-3 py-3 space-y-2.5">
            {mode === 'rent' ? (
              <>
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f4f0] flex items-center justify-center mb-3">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1c1c1e]">No listings found</p>
                    <p className="text-[11px] text-[#9ca3af] mt-1">Try adjusting your filters</p>
                  </div>
                )}
                {filtered.map(listing => (
                  <div key={listing.id} onClick={() => setLocalDetailId(listing.id)} className="cursor-pointer flex bg-white rounded-2xl border border-[#e8e7e3] hover:border-[#c0bfbb] hover:shadow-md transition-all overflow-hidden h-[100px] group">
                    <div className="relative w-[100px] flex-shrink-0 h-full">
                      <img src={listing.img} alt={listing.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                      <div className="absolute top-2 left-2">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${listing.badgeColor}`}>{listing.badge}</span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between px-3 py-2.5 flex-1 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[12px] font-bold text-[#1c1c1e] leading-tight truncate">{listing.name}</p>
                          <button onClick={e => { e.stopPropagation(); toggleSaved(listing.id) }} className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f5f4f0] flex items-center justify-center transition-colors hover:bg-[#ebe9e4]">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill={savedIds.has(listing.id) ? '#ef4444' : 'none'} stroke={savedIds.has(listing.id) ? '#ef4444' : '#6c6a66'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-[#9ca3af] truncate leading-tight mt-0.5">{listing.address}</p>
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-[#1c1c1e] leading-tight">${listing.price}<span className="text-[10px] font-normal text-[#9ca3af]">/month</span></p>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className="flex items-center gap-1 text-[9px] text-[#6c6a66]">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                            {listing.beds}
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-[#6c6a66]">
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                            {listing.sqft}
                          </span>
                          {listing.floor && (
                            <span className="flex items-center gap-1 text-[9px] text-[#6c6a66]">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                              Fl {listing.floor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              /* ── SUBLEASE CARDS ───────────────────────────────── */
              <>
                {filteredSubleases.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1c1c1e]">No subleases found</p>
                    <p className="text-[11px] text-[#9ca3af] mt-1">Try adjusting your filters</p>
                  </div>
                )}
                {filteredSubleases.map(s => (
                  <div key={s.id} onClick={() => setHighlightPinId(s.id)} className="cursor-pointer flex flex-col bg-white rounded-2xl border border-[#e8e7e3] hover:border-[#c0bfbb] hover:shadow-md transition-all overflow-hidden group">
                    {/* Top: image + info */}
                    <div className="flex h-[96px]">
                      <div className="relative w-[96px] flex-shrink-0 h-full">
                        <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                        <div className="absolute top-2 left-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.badgeColor}`}>{s.badge}</span>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between px-3 py-2.5 flex-1 min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-[12px] font-bold text-[#1c1c1e] leading-tight truncate">{s.name}</p>
                            <button onClick={e => { e.stopPropagation(); toggleSaved(s.id) }} className="flex-shrink-0 w-6 h-6 rounded-full bg-[#f5f4f0] flex items-center justify-center transition-colors hover:bg-[#ebe9e4]">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill={savedIds.has(s.id) ? '#ef4444' : 'none'} stroke={savedIds.has(s.id) ? '#ef4444' : '#6c6a66'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            </button>
                          </div>
                          <p className="text-[10px] text-[#9ca3af] truncate leading-tight mt-0.5">{s.address}</p>
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-[#1c1c1e] leading-tight">${s.price}<span className="text-[10px] font-normal text-[#9ca3af]">/month</span></p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[9px] text-[#6c6a66]">{s.beds}</span>
                            <span className="text-[9px] text-[#6c6a66]">·</span>
                            <span className="text-[9px] text-[#6c6a66]">{s.sqft}</span>
                            {s.furnished && <span className="text-[9px] bg-[#f5f4f0] text-[#6c6a66] font-semibold px-1.5 py-0.5 rounded-full">Furnished</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: availability + poster */}
                    <div className="border-t border-[#f0efeb] px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span className="text-[10px] text-[#6c6a66] font-medium">{s.available}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.daysLeft <= 7 && (
                          <span className="text-[9px] bg-[#1c1c1e] text-white font-bold px-1.5 py-0.5 rounded-full">{s.daysLeft}d left</span>
                        )}
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 rounded-full bg-[#e8e7e3] flex items-center justify-center text-[7px] font-bold text-[#6c6a66]">
                            {s.postedBy[0]}
                          </div>
                          <span className="text-[9px] text-[#9ca3af]">{s.postedBy}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
          </div>{/* end fixed bottom section */}
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
            const tmpl = `Hi ${pin.postedBy.split(' ')[0]}! I'm interested in your sublease at ${pin.address} for ${pin.period} (${pin.available}, $${pin.price}/mo). Could you share more details? I'm a UIUC student and this fits my schedule perfectly.`
            setMessageText(tmpl)
            setMessageTarget(pin)
          }}
          filteredIds={mode === 'rent' ? filtered.map(l => l.id) : undefined}
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
