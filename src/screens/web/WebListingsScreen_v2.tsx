import { useState, useRef } from 'react'
import { listings } from '../../data/listings'

// ── Sublease data (inline) ────────────────────────────────────────────────────
const subleases = [
  { id: 1, name: 'Studio on Green St', price: 680, period: 'Summer', verified: true, beds: 'Studio', sqft: '420 sqft', img: listings[1].img, address: '302 E Green St', walkMins: 7, amenities: ['Furnished', 'Utilities incl.', 'Parking', 'Study room', 'Common space'], available: 'May 15 – Aug 15', postedBy: 'Emma W.', desc: 'Going home for the summer and subleasing my studio. Fully furnished, utilities included. Walk to campus in under 10 minutes. Everything you need is already there.' },
  { id: 2, name: '1BR near Grainger', price: 790, period: 'Spring', verified: true, beds: '1B1B', sqft: '560 sqft', img: listings[2].img, address: '512 E Green St', walkMins: 9, amenities: ['In-unit laundry', 'AC', 'Internet incl.', 'Study room', 'Gym'], available: 'Jan 1 – May 10', postedBy: 'Marcus T.', desc: 'Study abroad for spring semester. Clean 1BR with in-unit laundry and fast internet. Great natural light and quiet building near engineering campus.' },
  { id: 3, name: '2BR Chalmers', price: 950, period: 'Fall', verified: false, beds: '2B2B', sqft: '820 sqft', img: listings[5].img, address: '502 W Chalmers St', walkMins: 5, amenities: ['Furnished', 'Balcony', 'Gym access', 'Common space', 'Parking'], available: 'Aug 20 – Dec 20', postedBy: 'Jordan L.', desc: 'Graduating early and looking for someone to take over. Spacious 2BR with balcony and gym. Could split with a friend. Building has rooftop access.' },
  { id: 4, name: 'Cozy Studio near BIF', price: 720, period: 'Summer', verified: true, beds: 'Studio', sqft: '390 sqft', img: listings[3].img, address: '409 E Chalmers St', walkMins: 6, amenities: ['Furnished', 'Near bus stop', 'Study room'], available: 'May 10 – Aug 10', postedBy: 'Priya K.', desc: 'Internship in Chicago — subleasing my cozy furnished studio near BIF. MTD stop right outside. Super convenient for anyone on campus daily.' },
  { id: 5, name: '1BR Springfield Ave', price: 760, period: 'Spring', verified: false, beds: '1B1B', sqft: '610 sqft', img: listings[6].img, address: '114 W Springfield Ave', walkMins: 8, amenities: ['Updated kitchen', 'Parking', 'Courtyard', 'Common space'], available: 'Jan 5 – Apr 30', postedBy: 'Tyler B.', desc: 'Transferring for spring. Nice 1BR with updated kitchen and a courtyard. Parking spot included. Quiet street, great for grad students.' },
  { id: 6, name: '2BR Orchard Downs', price: 880, period: 'Fall', verified: true, beds: '2B1B', sqft: '750 sqft', img: listings[7].img, address: '2002 Orchard Downs Dr', walkMins: 12, amenities: ['Private yard', 'Parking', 'AC', 'Gym', 'Common space'], available: 'Aug 15 – Dec 15', postedBy: 'Sam P.', desc: 'Leaving for a semester abroad. Spacious 2BR near ACES, private yard and parking. Great for two roommates splitting rent.' },
]
const subleaseToMapId: Record<number, number> = { 1: 101, 2: 102, 3: 103, 4: 104, 5: 105, 6: 101 }

const sortOptions    = ['Best Match', 'Price: Low', 'Price: High']

// ── Synced with Explore Map ───────────────────────────────────────────────────
const placeTypes = [
  { id: 'apartments', label: 'Apartments', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M3 9h6M3 15h6M15 3v18M15 9h6M15 15h6"/></svg> },
  { id: 'house',      label: 'House',      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  { id: 'studio',     label: 'Studio',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 10h16"/></svg> },
  { id: 'room',       label: 'Room',       icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h20v16H2z"/><path d="M12 4v16"/></svg> },
]
const bedroomOptions = ['Studio', '1', '2', '3', '4', '5+']
const floorOptions   = ['1', '2', '3', '4', '5', '6+']
const areaOptions    = [
  { id: 'green',    label: 'Green Street', emoji: '🏙️' },
  { id: 'quad',     label: 'Main Quad',    emoji: '🎓' },
  { id: 'first',    label: 'First Street', emoji: '🏘️' },
  { id: 'chalmers', label: 'Chalmers',     emoji: '🌆' },
  { id: 'south',    label: 'South Campus', emoji: '🌿' },
]
const amenityOptions = [
  { key: 'laundry', label: 'In-unit laundry' },
  { key: 'pet',     label: 'Pets allowed' },
  { key: 'parking', label: 'Parking' },
  { key: 'study',   label: 'Study room' },
  { key: 'common',  label: 'Common space' },
  { key: 'gym',     label: 'Gym' },
]
const availableOptions = ['Any', 'Jul 2026', 'Aug 2026']
const walkOptions: { label: string; max: number }[] = [{ label: 'Any', max: Infinity }, { label: '≤5 min', max: 5 }, { label: '≤10 min', max: 10 }, { label: '≤15 min', max: 15 }]
const campusDestOptions: { key: string; label: string; emoji: string }[] = [
  { key: 'any',  label: 'Any building',    emoji: '🎓' },
  { key: 'eng',  label: 'Grainger (Eng)',  emoji: '⚙️' },
  { key: 'bus',  label: 'Gies (Business)', emoji: '📊' },
  { key: 'las',  label: 'LAS',             emoji: '📚' },
  { key: 'agr',  label: 'ACES (Agr)',      emoji: '🌾' },
  { key: 'med',  label: 'Carle (Med)',      emoji: '🏥' },
  { key: 'art',  label: 'FAA (Art)',        emoji: '🎨' },
]

interface Props {
  onViewListing:  (id: number) => void
  savedIds?:      Set<number>
  onToggleSave?:  (id: number) => void
  onViewOnMap?:   (id: number) => void
  onNavigate?:    (tab: string) => void
}

export default function WebListingsScreen({ onViewListing, savedIds: savedIdsProp, onToggleSave, onViewOnMap, onNavigate }: Props) {
  // ── shared ──
  const [mode, setMode] = useState<'rent' | 'sublease'>('rent')

  // ── rent state (synced with Explore Map) ──
  const [placeType,    setPlaceType]    = useState('apartments')
  const [selectedBed,  setSelectedBed]  = useState('')
  const [selectedFloor,setSelectedFloor]= useState('')
  const [selectedArea, setSelectedArea] = useState('')
  const [priceMin,     setPriceMin]     = useState(500)
  const [priceMax,     setPriceMaxVal]  = useState(1100)
  const [minInput,     setMinInput]     = useState('500')
  const [maxInput,     setMaxInput]     = useState('1100')
  const minDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const maxDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [amenities,    setAmenities]    = useState<Set<string>>(new Set())
  const [amenitiesOpen, setAmenitiesOpen] = useState(false)
  const [activeAvailable, setActiveAvailable] = useState('Any')
  const [activeWalk,   setActiveWalk]   = useState('Any')
  const [walkTo,       setWalkTo]       = useState('any')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [showFilters,  setShowFilters]  = useState(false)
  const [sortBy,             setSortBy]             = useState('Best Match')
  const [localSavedIds,      setLocalSavedIds]      = useState<Set<number>>(new Set())
  const savedIds = savedIdsProp ?? localSavedIds
  const [showSavedOnly] = useState(false)
  const [search,        setSearch]        = useState('')

  // ── sublease state ──
  const [activeRoomType, setActiveRoomType] = useState('All')
  const [subSortBy] = useState('Nearest first')
  const [subPriceMin,  setSubPriceMin]      = useState(500)
  const [subPriceMax,  setSubPriceMax]      = useState(1200)
  const [subMinInput,  setSubMinInput]      = useState('500')
  const [subMaxInput,  setSubMaxInput]      = useState('1200')
  const subMinDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subMaxDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activePeriod, setActivePeriod]     = useState('All')
  const [subAmenities, setSubAmenities]     = useState<Set<string>>(new Set())
  const [subAmenitiesOpen, setSubAmenitiesOpen] = useState(false)
  const [subSelectedArea, setSubSelectedArea] = useState('')
  const [subActiveWalk, setSubActiveWalk]   = useState('Any')
  const [subWalkTo,    setSubWalkTo]        = useState('any')
  const [subVerifiedOnly, setSubVerifiedOnly] = useState(false)
  const [subSavedIds,  setSubSavedIds]      = useState<Set<number>>(new Set())
  const [selected,     setSelected]         = useState<typeof subleases[0] | null>(null)
  const [detailTab,    setDetailTab]        = useState<'overview' | 'amenities' | 'contact'>('overview')
  const [showMessage,  setShowMessage]      = useState(false)
  const [messageText,  setMessageText]      = useState('')
  const [messageSent,  setMessageSent]      = useState(false)
  const [interestSent, setInterestSent]     = useState(false)
  const [showPost,     setShowPost]         = useState(false)
  const [showSubFilters, setShowSubFilters] = useState(false)
  const [postSuccess,  setPostSuccess]      = useState(false)
  const [toast,        setToast]            = useState<string | null>(null)

  // ── helpers ──
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const toggleRentSave = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onToggleSave) { onToggleSave(id); return }
    setLocalSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const toggleSubSave = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSubSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  const sendMessage = () => {
    if (!messageText.trim()) return
    setMessageSent(true)
  }
  const expressInterest = () => {
    setInterestSent(true)
    showToast('Interest sent! ' + (selected?.postedBy.split(' ')[0] ?? 'Poster') + ' will be notified.')
    setTimeout(() => setInterestSent(false), 3000)
  }

  // ── helpers ──
  const toggleAmenity = (k: string) => setAmenities(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n })
  const activeFilterCount = (placeType !== 'apartments' ? 1 : 0) + (selectedBed ? 1 : 0) + (selectedFloor ? 1 : 0) + (selectedArea ? 1 : 0) + (priceMin !== 500 || priceMax !== 1100 ? 1 : 0) + amenities.size + (activeAvailable !== 'Any' ? 1 : 0) + (activeWalk !== 'Any' ? 1 : 0) + (walkTo !== 'any' ? 1 : 0) + (verifiedOnly ? 1 : 0)
  const clearFilters = () => { setPlaceType('apartments'); setSelectedBed(''); setSelectedFloor(''); setSelectedArea(''); setPriceMin(500); setPriceMaxVal(1100); setAmenities(new Set()); setActiveAvailable('Any'); setActiveWalk('Any'); setWalkTo('any'); setVerifiedOnly(false) }

  // ── rent filtering ──
  const filteredRent = listings.filter(l => {
    const matchesBed = !selectedBed ||
      (selectedBed === 'Studio' && l.beds === 'Studio') ||
      (selectedBed === '1' && l.beds === '1B1B') ||
      (selectedBed === '2' && (l.beds === '2B1B' || l.beds === '2B2B')) ||
      (selectedBed === '3' && l.beds.startsWith('3')) ||
      (selectedBed === '4' && l.beds.startsWith('4')) ||
      (selectedBed === '5+' && parseInt(l.beds) >= 5)
    const matchesArea = !selectedArea || l.neighborhood === selectedArea
    const matchesPrice = l.price >= priceMin && l.price <= priceMax
    const matchesAmenities = amenities.size === 0 || [...amenities].every(k => {
      if (k === 'laundry') return l.amenities.some(a => a.toLowerCase().includes('laundry'))
      if (k === 'pet')     return l.amenities.some(a => a.toLowerCase().includes('pet'))
      if (k === 'parking') return l.amenities.some(a => a.toLowerCase().includes('parking'))
      if (k === 'study')   return l.amenities.some(a => a.toLowerCase().includes('study'))
      if (k === 'common')  return l.amenities.some(a => a.toLowerCase().includes('common'))
      if (k === 'gym')     return l.amenities.some(a => a.toLowerCase().includes('gym'))
      return false
    })
    const matchesAvailable = activeAvailable === 'Any' || l.available.includes(activeAvailable)
    const walkMins = walkTo === 'any' ? Math.min(...Object.values(l.walkFrom)) : (l.walkFrom[walkTo as keyof typeof l.walkFrom] ?? 99)
    const walkMax = walkOptions.find(w => w.label === activeWalk)?.max ?? Infinity
    const matchesWalk = walkMins <= walkMax
    const matchesVerified = !verifiedOnly || l.badge === 'Verified'
    const matchesSearch = search.trim() === '' || l.name.toLowerCase().includes(search.toLowerCase()) || l.address.toLowerCase().includes(search.toLowerCase()) || l.amenities.some(a => a.toLowerCase().includes(search.toLowerCase()))
    const matchesSaved = !showSavedOnly || savedIds.has(l.id)
    return matchesBed && matchesArea && matchesPrice && matchesAmenities && matchesAvailable && matchesWalk && matchesVerified && matchesSearch && matchesSaved
  })
  const sortedRent = [...filteredRent].sort((a, b) => sortBy === 'Price: Low' ? a.price - b.price : sortBy === 'Price: High' ? b.price - a.price : 0)

  // ── sublease area options ──
  const subAreaOptions = [
    { id: 'green',    label: 'Green Street',  emoji: '🏙️' },
    { id: 'chalmers', label: 'Chalmers',      emoji: '🌆' },
    { id: 'springfield', label: 'Springfield', emoji: '🏘️' },
    { id: 'orchard',  label: 'Orchard Downs', emoji: '🌿' },
  ]
  const subAreaKeywords: Record<string, string> = { green: 'green', chalmers: 'chalmers', springfield: 'springfield', orchard: 'orchard' }

  // ── sublease filtering + sorting ──
  const subWalkMax = subActiveWalk === '≤5 min' ? 5 : subActiveWalk === '≤10 min' ? 10 : subActiveWalk === '≤15 min' ? 15 : Infinity
  const filteredSub = subleases
    .filter(s =>
      (activeRoomType === 'All' || s.beds === activeRoomType) &&
      s.price >= subPriceMin && s.price <= subPriceMax &&
      (activePeriod === 'All' || s.period === activePeriod) &&
      (!subSelectedArea || s.address.toLowerCase().includes(subAreaKeywords[subSelectedArea] ?? '')) &&
      (subAmenities.size === 0 || [...subAmenities].every(k => s.amenities.some(a => a.toLowerCase().includes(k)))) &&
      s.walkMins <= subWalkMax &&
      (!subVerifiedOnly || s.verified)
    )
    .sort((a, b) =>
      subSortBy === 'Price: Low'  ? a.price - b.price :
      subSortBy === 'Price: High' ? b.price - a.price :
      a.walkMins - b.walkMins
    )
  const clearSubFilters = () => {
    setActiveRoomType('All'); setSubPriceMin(500); setSubPriceMax(1200)
    setSubMinInput('500'); setSubMaxInput('1200'); setActivePeriod('All')
    setSubSelectedArea(''); setSubAmenities(new Set())
    setSubActiveWalk('Any'); setSubWalkTo('any'); setSubVerifiedOnly(false)
  }
  const subFilterCount = (activeRoomType !== 'All' ? 1 : 0) + (subPriceMin !== 500 || subPriceMax !== 1200 ? 1 : 0) + (activePeriod !== 'All' ? 1 : 0) + (subSelectedArea ? 1 : 0) + subAmenities.size + (subActiveWalk !== 'Any' ? 1 : 0) + (subVerifiedOnly ? 1 : 0)

  // ── Sublease detail view ──────────────────────────────────────────────────
  if (selected) {
    return (
      <>
        <div className="flex flex-col flex-1 overflow-hidden bg-[#f7f6f2]" style={{ animation: 'fadeIn 0.18s ease' }}>
          <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

          <div className="relative flex-shrink-0 flex flex-col" style={{ height: '42%' }}>
            <div className="flex-1 relative overflow-hidden">
              <img src={selected.img} alt={selected.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between">
                <button onClick={() => { setSelected(null); window.location.hash = 'listings/sublease' }} className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-[13px] font-semibold text-[#1c1c1e] shadow-sm hover:bg-white transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Back
                </button>
                <div className="flex items-center gap-2">
                  {selected.verified && (
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span className="text-[12px] font-semibold text-[#1c1c1e]">Verified</span>
                    </div>
                  )}
                  <button onClick={() => toggleSubSave(selected.id)} className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={subSavedIds.has(selected.id) ? '#1c1c1e' : 'none'} stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-[#1c1c1e] flex-shrink-0 flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-[16px] font-bold text-white truncate">{selected.name}</h1>
                  <span className="text-[10px] font-semibold text-white/60 bg-white/15 px-2 py-0.5 rounded-full flex-shrink-0">{selected.period}</span>
                </div>
                <p className="text-[12px] text-white/50 truncate">{selected.address}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[22px] font-black text-white leading-none">${selected.price.toLocaleString()}</p>
                <p className="text-[11px] text-white/40 mt-0.5">per month</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden bg-white border-t border-[#e5e4e0]">
            <div className="px-6 pt-4 pb-0 flex-shrink-0">
              <div className="flex gap-2 mb-4 flex-wrap">
                {[['beds', selected.beds], ['sqft', selected.sqft], ['cal', selected.available], ['clock', `${selected.walkMins} min walk`]].map(([, val]) => (
                  <div key={val} className="flex items-center gap-1.5 bg-[#f7f6f2] rounded-xl px-3 py-2">
                    <span className="text-[12px] font-semibold text-[#1c1c1e]">{val}</span>
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  {onViewOnMap && (
                    <button onClick={() => onViewOnMap(subleaseToMapId[selected.id] ?? 101)} className="flex items-center gap-1.5 px-4 py-2 bg-[#f5f4f0] text-[#1c1c1e] text-[12px] font-semibold rounded-xl hover:bg-[#e5e4e0] transition-colors">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                      View on map
                    </button>
                  )}
                  <button onClick={() => setShowMessage(true)} className="px-4 py-2 bg-[#f5f4f0] text-[#1c1c1e] text-[12px] font-semibold rounded-xl hover:bg-[#e5e4e0] transition-colors">Message poster</button>
                  <button onClick={expressInterest} disabled={interestSent} className={`px-4 py-2 text-[12px] font-semibold rounded-xl transition-colors ${interestSent ? 'bg-[#f5f4f0] text-[#6c6a66] cursor-default' : 'bg-[#1c1c1e] text-white hover:bg-[#333]'}`}>{interestSent ? '✓ Interest sent' : 'Express interest →'}</button>
                </div>
              </div>
              <div className="flex border-b border-[#f0efeb] gap-5">
                {(['overview', 'amenities', 'contact'] as const).map(tab => (
                  <button key={tab} onClick={() => { setDetailTab(tab); window.location.hash = `listings/sublease/${selected?.id}/${tab}` }} className={`py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-all capitalize ${detailTab === tab ? 'border-[#1c1c1e] text-[#1c1c1e]' : 'border-transparent text-[#9ca3af] hover:text-[#1c1c1e]'}`}>
                    {tab === 'overview' ? 'Overview' : tab === 'amenities' ? 'Amenities' : 'Contact'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  <p className="text-[14px] text-[#3c3c3e] leading-relaxed">{selected.desc}</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Quick facts</p>
                      <div className="space-y-2">
                        {[['Period', `${selected.period} semester`], ['Available', selected.available], ['Bedrooms', selected.beds], ['Size', selected.sqft], ['Walk to campus', `${selected.walkMins} min`], ['Furnished', selected.amenities.includes('Furnished') ? 'Yes' : 'No']].map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between bg-[#f9f8f6] rounded-xl px-3.5 py-2.5">
                            <span className="text-[12px] text-[#6c6a66]">{k}</span>
                            <span className="text-[12px] font-semibold text-[#1c1c1e]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Included</p>
                        <div className="flex flex-wrap gap-1.5">{selected.amenities.map(a => <span key={a} className="text-[12px] bg-[#f9f8f6] border border-[#eeecea] text-[#1c1c1e] px-3 py-1.5 rounded-xl font-medium">{a}</span>)}</div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Posted by</p>
                        <div className="bg-[#f9f8f6] rounded-2xl p-3.5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1c1c1e] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">{selected.postedBy[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#1c1c1e]">{selected.postedBy}</p>
                            <p className="text-[11px] text-[#6c6a66] mt-0.5">UIUC Student · Verified poster</p>
                          </div>
                          <button onClick={() => setShowMessage(true)} className="px-3 py-1.5 bg-[#1c1c1e] text-white text-[11px] font-semibold rounded-xl hover:bg-[#333] transition-colors flex-shrink-0">Message →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {detailTab === 'amenities' && (
                <div>
                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-4">All amenities</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selected.amenities.map(a => (
                      <div key={a} className="bg-[#f9f8f6] rounded-2xl p-3 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#f0efeb] flex items-center justify-center flex-shrink-0">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <span className="text-[12px] font-medium text-[#1c1c1e] leading-snug">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detailTab === 'contact' && (
                <div className="space-y-5">
                  <div className="bg-[#f9f8f6] rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#1c1c1e] flex items-center justify-center text-white text-base font-bold flex-shrink-0">{selected.postedBy[0]}</div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#1c1c1e]">{selected.postedBy}</p>
                        <p className="text-[12px] text-[#6c6a66]">UIUC Student · Posted this sublease</p>
                      </div>
                    </div>
                    <button onClick={() => setShowMessage(true)} className="w-full py-3 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">Send message →</button>
                  </div>
                  <div className="bg-[#f9f8f6] rounded-2xl p-4">
                    <p className="text-[12px] font-bold text-[#9ca3af] uppercase tracking-widest mb-2">Availability</p>
                    <p className="text-[15px] font-semibold text-[#1c1c1e]">{selected.available}</p>
                    <p className="text-[12px] text-[#6c6a66] mt-1">{selected.period} semester sublease</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message modal */}
        {showMessage && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => !messageSent && setShowMessage(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md mx-6 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              {messageSent ? (
                <div className="text-center py-4 px-6 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#f5f4f0] flex items-center justify-center mx-auto">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[15px] font-bold text-[#1c1c1e]">Message sent!</p>
                  <p className="text-[13px] text-[#6c6a66]">{selected?.postedBy.split(' ')[0]} will get back to you soon.</p>
                  <div className="flex flex-col gap-2 pt-2 pb-2">
                    <button onClick={() => { setSelected(null); window.location.hash = 'messages'; onNavigate?.('messages') }} className="w-full py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">
                      View in Messages
                    </button>
                    <button onClick={() => { setMessageSent(false); setMessageText(''); setShowMessage(false) }} className="w-full py-2.5 bg-[#f5f4f0] text-[#1c1c1e] text-[13px] font-semibold rounded-xl hover:bg-[#e5e4e0] transition-colors">
                      Back to listing
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0efeb]">
                    <p className="text-[15px] font-bold text-[#1c1c1e]">Message {selected.postedBy.split(' ')[0]}</p>
                    <button onClick={() => setShowMessage(false)} className="w-7 h-7 rounded-lg bg-[#f5f4f0] flex items-center justify-center hover:bg-[#e5e4e0] transition-colors">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div className="px-5 py-4">
                    <div className="bg-[#f9f8f6] rounded-xl px-4 py-3 mb-3">
                      <p className="text-[12px] text-[#6c6a66]">Re: <span className="font-semibold text-[#1c1c1e]">{selected.name}</span> · {selected.available}</p>
                    </div>
                    <textarea value={messageText} onChange={e => setMessageText(e.target.value)} placeholder={`Hi, I'm interested in your sublease at ${selected.address}…`} className="w-full h-28 text-[13px] text-[#1c1c1e] placeholder-[#aaa] bg-[#f9f8f6] rounded-xl px-4 py-3 outline-none resize-none border border-transparent focus:border-[#e5e4e0]" />
                    <button onClick={sendMessage} disabled={!messageText.trim()} className="mt-3 w-full py-3 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Send message →</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1c1c1e] text-white text-[13px] font-semibold px-5 py-2.5 rounded-2xl shadow-lg z-50 pointer-events-none" style={{ animation: 'fadeIn 0.15s ease' }}>
            {toast}
          </div>
        )}
      </>
    )
  }

  // ── Main list view ────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f0]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e4e0]">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Listings</h1>
              <p className="text-sm text-[#6c6a66] mt-0.5">
                {mode === 'rent'
                  ? `${sortedRent.length} apartments available near UIUC`
                  : `${filteredSub.length} subleases from UIUC students`}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Rent / Sublease toggle */}
              <div className="flex bg-[#f5f4f0] rounded-xl p-1 gap-1">
                {(['rent', 'sublease'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setShowFilters(false); setShowSubFilters(false); window.location.hash = m === 'sublease' ? 'listings/sublease' : 'listings'; }}
                    className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${mode === m ? 'bg-white text-[#1c1c1e] shadow-sm' : 'text-[#6c6a66] hover:text-[#1c1c1e]'}`}
                  >
                    {m === 'rent' ? 'Rent' : 'Sublease'}
                  </button>
                ))}
              </div>

              {/* Search (rent only) */}
              {mode === 'rent' && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#f5f4f0] rounded-xl border border-transparent hover:border-[#e0deda] w-48">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 text-[13px] text-[#1c1c1e] placeholder-[#aaa] bg-transparent outline-none" />
                </div>
              )}

              {/* Sort (rent only) */}
              {mode === 'rent' && (
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-sm border border-[#e5e4e0] rounded-xl px-3 py-2.5 text-[#1c1c1e] bg-white outline-none">
                  {sortOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              )}

              {/* Filter toggle (rent only) */}
              {mode === 'rent' && (
                <button onClick={() => setShowFilters(s => { const next = !s; window.location.hash = next ? 'listings/filter' : 'listings'; return next; })} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all border ${showFilters || activeFilterCount > 0 ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'bg-white text-[#1c1c1e] border-[#e5e4e0] hover:border-[#1c1c1e]'}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                  Filters
                  {activeFilterCount > 0 && <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${showFilters || activeFilterCount > 0 ? 'bg-white text-[#1c1c1e]' : 'bg-[#1c1c1e] text-white'}`}>{activeFilterCount}</span>}
                </button>
              )}

              {/* Filter toggle (sublease) */}
              {mode === 'sublease' && (
                <button onClick={() => setShowSubFilters(s => { const next = !s; window.location.hash = next ? 'listings/sublease/filter' : 'listings/sublease'; return next; })} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all border ${showSubFilters || subFilterCount > 0 ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'bg-white text-[#1c1c1e] border-[#e5e4e0] hover:border-[#1c1c1e]'}`}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                  Filters
                  {subFilterCount > 0 && <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${showSubFilters || subFilterCount > 0 ? 'bg-white text-[#1c1c1e]' : 'bg-[#1c1c1e] text-white'}`}>{subFilterCount}</span>}
                </button>
              )}

              {/* Post sublease (sublease only) */}
              {mode === 'sublease' && (
                <button onClick={() => setShowPost(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Post a sublease
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {mode === 'rent' && activeFilterCount > 0 && !showFilters && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {placeType !== 'apartments' && <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">{placeTypes.find(p => p.id === placeType)?.label} <button onClick={() => setPlaceType('apartments')} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span>}
              {selectedBed && <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">{selectedBed === 'Studio' ? 'Studio' : `${selectedBed} bed`} <button onClick={() => setSelectedBed('')} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span>}
              {selectedFloor && <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">Floor {selectedFloor} <button onClick={() => setSelectedFloor('')} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span>}
              {(priceMin !== 500 || priceMax !== 1100) && <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">${priceMin}–${priceMax}/mo <button onClick={() => { setPriceMin(500); setPriceMaxVal(1100) }} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span>}
              {selectedArea && <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">{areaOptions.find(a => a.id === selectedArea)?.label} <button onClick={() => setSelectedArea('')} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span>}
              {activeAvailable !== 'Any' && <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">{activeAvailable} <button onClick={() => setActiveAvailable('Any')} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span>}
              {(activeWalk !== 'Any' || walkTo !== 'any') && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">
                  {activeWalk !== 'Any' ? activeWalk : ''}
                  {activeWalk !== 'Any' && walkTo !== 'any' ? ' · ' : ''}
                  {walkTo !== 'any' ? campusDestOptions.find(d => d.key === walkTo)?.emoji + ' ' + campusDestOptions.find(d => d.key === walkTo)?.label : ''}
                  <button onClick={() => { setActiveWalk('Any'); setWalkTo('any') }} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button>
                </span>
              )}
              {verifiedOnly && <span className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">✓ Verified <button onClick={() => setVerifiedOnly(false)} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span>}
              {[...amenities].map(k => { const opt = amenityOptions.find(o => o.key === k); return opt ? <span key={k} className="flex items-center gap-1.5 px-3 py-1 bg-[#f0efeb] rounded-full text-[12px] font-semibold text-[#1c1c1e]">{opt.label} <button onClick={() => toggleAmenity(k)} className="text-[#9ca3af] hover:text-[#1c1c1e]">×</button></span> : null })}
              <button onClick={clearFilters} className="text-[12px] text-[#9ca3af] hover:text-[#1c1c1e] transition-colors">Clear all</button>
            </div>
          )}

          {/* Collapsible filter panel */}
          {mode === 'rent' && showFilters && (
            <div className="mt-4 p-4 bg-[#f9f8f6] rounded-2xl border border-[#eeecea] space-y-4">

              {/* Place type */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Type</span>
                <div className="flex gap-2 flex-wrap">
                  {placeTypes.map(p => (
                    <button key={p.id} onClick={() => setPlaceType(p.id)} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${placeType === p.id ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>
                      {p.icon}{p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Beds</span>
                <div className="flex gap-2 flex-wrap">
                  {bedroomOptions.map(b => (
                    <button key={b} onClick={() => setSelectedBed(selectedBed === b ? '' : b)} className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${selectedBed === b ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{b}</button>
                  ))}
                </div>
              </div>

              {/* Floor */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Floor</span>
                <div className="flex gap-2 flex-wrap">
                  {floorOptions.map(f => (
                    <button key={f} onClick={() => setSelectedFloor(selectedFloor === f ? '' : f)} className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${selectedFloor === f ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Price</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white border border-[#e5e4e0] rounded-xl px-3 py-2 focus-within:border-[#1c1c1e] transition-colors w-28">
                    <span className="text-[12px] text-[#9ca3af]">$</span>
                    <input type="number" value={minInput} min={500} max={priceMax - 50} step={50}
                      onChange={e => {
                        setMinInput(e.target.value)
                        if (minDebounce.current) clearTimeout(minDebounce.current)
                        minDebounce.current = setTimeout(() => {
                          const v = Math.min(Math.max(parseInt(e.target.value) || 500, 500), priceMax - 50)
                          setPriceMin(v); setMinInput(String(v))
                        }, 350)
                      }}
                      onBlur={() => { if (minDebounce.current) clearTimeout(minDebounce.current); const v = Math.min(Math.max(parseInt(minInput) || 500, 500), priceMax - 50); setPriceMin(v); setMinInput(String(v)) }}
                      className="flex-1 text-[13px] text-[#1c1c1e] bg-transparent outline-none w-16" />
                  </div>
                  <span className="text-[12px] text-[#9ca3af]">–</span>
                  <div className="flex items-center gap-1.5 bg-white border border-[#e5e4e0] rounded-xl px-3 py-2 focus-within:border-[#1c1c1e] transition-colors w-28">
                    <span className="text-[12px] text-[#9ca3af]">$</span>
                    <input type="number" value={maxInput} min={priceMin + 50} max={2000} step={50}
                      onChange={e => {
                        setMaxInput(e.target.value)
                        if (maxDebounce.current) clearTimeout(maxDebounce.current)
                        maxDebounce.current = setTimeout(() => {
                          const v = Math.max(Math.min(parseInt(e.target.value) || 1100, 2000), priceMin + 50)
                          setPriceMaxVal(v); setMaxInput(String(v))
                        }, 350)
                      }}
                      onBlur={() => { if (maxDebounce.current) clearTimeout(maxDebounce.current); const v = Math.max(Math.min(parseInt(maxInput) || 1100, 2000), priceMin + 50); setPriceMaxVal(v); setMaxInput(String(v)) }}
                      className="flex-1 text-[13px] text-[#1c1c1e] bg-transparent outline-none w-16" />
                  </div>
                  <span className="text-[12px] text-[#9ca3af]">/ mo</span>
                  <div className="flex gap-1.5">
                    {[700, 800, 900, 1000].map(c => (
                      <button key={c} onClick={() => { setPriceMin(500); setPriceMaxVal(c) }} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${priceMin === 500 && priceMax === c ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e]'}`}>≤${c}</button>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#9ca3af]">→ <span className="font-semibold text-[#1c1c1e]">{sortedRent.length}</span> listing{sortedRent.length !== 1 ? 's' : ''} match</span>
                </div>
              </div>

              {/* Area */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Area</span>
                <div className="flex gap-2 flex-wrap">
                  {areaOptions.map(a => (
                    <button key={a.id} onClick={() => setSelectedArea(selectedArea === a.id ? '' : a.id)} className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${selectedArea === a.id ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>
                      <span>{a.emoji}</span>{a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setAmenitiesOpen(o => !o)}
                  className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0 mt-1 flex items-center gap-1 hover:text-[#1c1c1e] transition-colors text-left"
                >
                  Amenities
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: amenitiesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease', flexShrink: 0 }}>
                    <polyline points="2 3.5 5 6.5 8 3.5" />
                  </svg>
                </button>
                <div className="flex-1">
                  {amenitiesOpen ? (
                    <div className="space-y-3">
                      {amenityOptions.map(a => (
                        <div key={a.key} className="flex items-center justify-between">
                          <span className="text-[13px] text-[#1c1c1e]">{a.label}</span>
                          <button onClick={() => toggleAmenity(a.key)} className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${amenities.has(a.key) ? 'bg-[#1c1c1e]' : 'bg-[#e5e4e0]'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${amenities.has(a.key) ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[13px] text-[#9ca3af] mt-1 block">
                      {amenities.size > 0 ? [...amenities].map(k => amenityOptions.find(o => o.key === k)?.label).filter(Boolean).join(', ') : 'None selected'}
                    </span>
                  )}
                </div>
              </div>

              {/* Move-in */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Move-in</span>
                <div className="flex gap-2 flex-wrap">
                  {availableOptions.map(o => (
                    <button key={o} onClick={() => setActiveAvailable(o)} className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${activeAvailable === o ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{o}</button>
                  ))}
                </div>
              </div>

              {/* Walk to campus */}
              <div className="flex items-start gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0 mt-1.5">Walk</span>
                <div className="flex-1 space-y-2">
                  {/* Destination selector */}
                  <div className="flex gap-2 flex-wrap">
                    {campusDestOptions.map(d => (
                      <button key={d.key} onClick={() => setWalkTo(d.key)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${walkTo === d.key ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>
                        <span>{d.emoji}</span>{d.label}
                      </button>
                    ))}
                  </div>
                  {/* Time selector */}
                  <div className="flex items-center gap-2">
                    {walkOptions.map(w => (
                      <button key={w.label} onClick={() => setActiveWalk(w.label)} className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${activeWalk === w.label ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{w.label}</button>
                    ))}
                    {walkTo !== 'any' && (
                      <span className="text-[11px] text-[#9ca3af] ml-1">to {campusDestOptions.find(d => d.key === walkTo)?.label}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified toggle */}
              <div className="flex items-center justify-between bg-white border border-[#e5e4e0] rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#1c1c1e]">Verified listings only</p>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">Show only landlord-verified apartments</p>
                </div>
                <button onClick={() => setVerifiedOnly(v => !v)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${verifiedOnly ? 'bg-[#1c1c1e]' : 'bg-[#e5e4e0]'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${verifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#eeecea]">
                <button onClick={clearFilters} className="text-[13px] text-[#9ca3af] hover:text-[#1c1c1e] transition-colors">Clear all</button>
                <button onClick={() => { setShowFilters(false); window.location.hash = 'listings'; }} className="px-5 py-2 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">
                  Show {sortedRent.length} result{sortedRent.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}

          {/* Sublease filter panel — mirrors Rent layout exactly */}
          {mode === 'sublease' && showSubFilters && (
            <div className="mt-4 p-4 bg-[#f9f8f6] rounded-2xl border border-[#eeecea] space-y-4">

              {/* Beds */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Beds</span>
                <div className="flex gap-2 flex-wrap">
                  {(['All', 'Studio', '1B1B', '2B1B', '2B2B'] as const).map(r => (
                    <button key={r} onClick={() => setActiveRoomType(r)} className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${activeRoomType === r ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{r}</button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Price</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 bg-white border border-[#e5e4e0] rounded-xl px-3 py-2 focus-within:border-[#1c1c1e] transition-colors w-28">
                    <span className="text-[12px] text-[#9ca3af]">$</span>
                    <input type="number" value={subMinInput} min={400} max={subPriceMax - 50} step={50}
                      onChange={e => { setSubMinInput(e.target.value); if (subMinDebounce.current) clearTimeout(subMinDebounce.current); subMinDebounce.current = setTimeout(() => { const v = Math.min(Math.max(parseInt(e.target.value) || 400, 400), subPriceMax - 50); setSubPriceMin(v); setSubMinInput(String(v)) }, 350) }}
                      onBlur={() => { if (subMinDebounce.current) clearTimeout(subMinDebounce.current); const v = Math.min(Math.max(parseInt(subMinInput) || 400, 400), subPriceMax - 50); setSubPriceMin(v); setSubMinInput(String(v)) }}
                      className="flex-1 text-[13px] text-[#1c1c1e] bg-transparent outline-none w-16" />
                  </div>
                  <span className="text-[12px] text-[#9ca3af]">–</span>
                  <div className="flex items-center gap-1.5 bg-white border border-[#e5e4e0] rounded-xl px-3 py-2 focus-within:border-[#1c1c1e] transition-colors w-28">
                    <span className="text-[12px] text-[#9ca3af]">$</span>
                    <input type="number" value={subMaxInput} min={subPriceMin + 50} max={2000} step={50}
                      onChange={e => { setSubMaxInput(e.target.value); if (subMaxDebounce.current) clearTimeout(subMaxDebounce.current); subMaxDebounce.current = setTimeout(() => { const v = Math.max(Math.min(parseInt(e.target.value) || 1200, 2000), subPriceMin + 50); setSubPriceMax(v); setSubMaxInput(String(v)) }, 350) }}
                      onBlur={() => { if (subMaxDebounce.current) clearTimeout(subMaxDebounce.current); const v = Math.max(Math.min(parseInt(subMaxInput) || 1200, 2000), subPriceMin + 50); setSubPriceMax(v); setSubMaxInput(String(v)) }}
                      className="flex-1 text-[13px] text-[#1c1c1e] bg-transparent outline-none w-16" />
                  </div>
                  <span className="text-[12px] text-[#9ca3af]">/ mo</span>
                  <div className="flex gap-1.5">
                    {[700, 800, 900, 1000].map(c => (
                      <button key={c} onClick={() => { setSubPriceMin(400); setSubPriceMax(c); setSubMinInput('400'); setSubMaxInput(String(c)) }} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${subPriceMin === 400 && subPriceMax === c ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e]'}`}>≤${c}</button>
                    ))}
                  </div>
                  <span className="text-[11px] text-[#9ca3af]">→ <span className="font-semibold text-[#1c1c1e]">{filteredSub.length}</span> listing{filteredSub.length !== 1 ? 's' : ''} match</span>
                </div>
              </div>

              {/* Area */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Area</span>
                <div className="flex gap-2 flex-wrap">
                  {subAreaOptions.map(a => (
                    <button key={a.id} onClick={() => setSubSelectedArea(subSelectedArea === a.id ? '' : a.id)} className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${subSelectedArea === a.id ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>
                      <span>{a.emoji}</span>{a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {(() => {
                const subAmenityOptions = [
                  { key: 'furnished', label: 'Furnished' },
                  { key: 'utilities', label: 'Utilities incl.' },
                  { key: 'parking',   label: 'Parking' },
                  { key: 'study',     label: 'Study room' },
                  { key: 'common',    label: 'Common space' },
                  { key: 'gym',       label: 'Gym' },
                ]
                return (
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setSubAmenitiesOpen(o => !o)}
                      className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0 mt-1 flex items-center gap-1 hover:text-[#1c1c1e] transition-colors text-left"
                    >
                      Amenities
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: subAmenitiesOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease', flexShrink: 0 }}>
                        <polyline points="2 3.5 5 6.5 8 3.5" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      {subAmenitiesOpen ? (
                        <div className="space-y-3">
                          {subAmenityOptions.map(a => (
                            <div key={a.key} className="flex items-center justify-between">
                              <span className="text-[13px] text-[#1c1c1e]">{a.label}</span>
                              <button onClick={() => setSubAmenities(prev => { const next = new Set(prev); next.has(a.key) ? next.delete(a.key) : next.add(a.key); return next })} className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${subAmenities.has(a.key) ? 'bg-[#1c1c1e]' : 'bg-[#e5e4e0]'}`}>
                                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${subAmenities.has(a.key) ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[13px] text-[#9ca3af] mt-1 block">
                          {subAmenities.size > 0 ? [...subAmenities].map(k => subAmenityOptions.find(o => o.key === k)?.label).filter(Boolean).join(', ') : 'None selected'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* Move-in period */}
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0">Period</span>
                <div className="flex gap-2 flex-wrap">
                  {['All', 'Summer', 'Spring', 'Fall'].map(p => (
                    <button key={p} onClick={() => setActivePeriod(p)} className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${activePeriod === p ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Walk to campus */}
              <div className="flex items-start gap-3">
                <span className="text-[12px] font-semibold text-[#6c6a66] w-16 flex-shrink-0 mt-1.5">Walk</span>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {campusDestOptions.map(d => (
                      <button key={d.key} onClick={() => setSubWalkTo(d.key)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${subWalkTo === d.key ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>
                        <span>{d.emoji}</span>{d.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {walkOptions.map(w => (
                      <button key={w.label} onClick={() => setSubActiveWalk(w.label)} className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${subActiveWalk === w.label ? 'bg-[#1c1c1e] text-white' : 'bg-white text-[#6c6a66] border border-[#e5e4e0] hover:border-[#1c1c1e] hover:text-[#1c1c1e]'}`}>{w.label}</button>
                    ))}
                    {subWalkTo !== 'any' && (
                      <span className="text-[11px] text-[#9ca3af] ml-1">to {campusDestOptions.find(d => d.key === subWalkTo)?.label}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Verified toggle */}
              <div className="flex items-center justify-between bg-white border border-[#e5e4e0] rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#1c1c1e]">Verified listings only</p>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">Show only verified subleases</p>
                </div>
                <button onClick={() => setSubVerifiedOnly(v => !v)} className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${subVerifiedOnly ? 'bg-[#1c1c1e]' : 'bg-[#e5e4e0]'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${subVerifiedOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-[#eeecea]">
                <button onClick={clearSubFilters} className="text-[13px] text-[#9ca3af] hover:text-[#1c1c1e] transition-colors">Clear all</button>
                <button onClick={() => { setShowSubFilters(false); window.location.hash = 'listings/sublease'; }} className="px-5 py-2 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">
                  Show {filteredSub.length} result{filteredSub.length !== 1 ? 's' : ''}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        {mode === 'rent' ? (
          sortedRent.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 text-3xl shadow-sm">🏠</div>
              <p className="text-[15px] font-semibold text-[#1c1c1e]">No listings found</p>
              <p className="text-[13px] text-[#9ca3af] mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {sortedRent.map(l => (
                <div key={l.id} onClick={() => onViewListing(l.id)} className="bg-white rounded-2xl overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-200">
                  <div className="relative h-44 overflow-hidden flex-shrink-0">
                    <img src={l.img} alt={l.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-xl ${l.badge === 'Verified' ? 'bg-[#1c1c1e] text-white' : 'bg-white/90 text-[#1c1c1e]'}`}>{l.badge}</span>
                    </div>
                    <div role="button" onClick={e => toggleRentSave(l.id, e as unknown as React.MouseEvent)} className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill={savedIds.has(l.id) ? '#1c1c1e' : 'none'} stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </div>
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[16px] font-black text-white leading-none">${l.price}<span className="text-[11px] font-normal text-white/70">/mo</span></span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="text-[10px] font-medium text-white/70 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">{l.available}</span>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <p className="text-[14px] font-bold text-[#1c1c1e] leading-tight mb-0.5">{l.name}</p>
                    <p className="text-[11px] text-[#9ca3af] mb-3 truncate">{l.address}</p>
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className="flex items-center gap-1 text-[11px] text-[#6c6a66] bg-[#f5f4f0] px-2 py-1 rounded-lg">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 9h20"/><path d="M2 9v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9"/><line x1="12" y1="9" x2="12" y2="20"/></svg>
                        {l.beds}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#6c6a66] bg-[#f5f4f0] px-2 py-1 rounded-lg">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                        {l.sqft}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#6c6a66] bg-[#f5f4f0] px-2 py-1 rounded-lg">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {Math.min(...Object.values(l.walkFrom))} min
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {l.amenities.slice(0, 3).map(a => <span key={a} className="text-[10px] text-[#6c6a66] bg-[#f9f8f6] border border-[#eeecea] px-2 py-0.5 rounded-lg">{a}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // ── Sublease grid ──
          <div className="grid grid-cols-3 gap-5">
            {filteredSub.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f4f0] flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <p className="text-[15px] font-bold text-[#1c1c1e] mb-1">No subleases found</p>
                <p className="text-[13px] text-[#9ca3af]">Try adjusting your filters</p>
              </div>
            )}
            {filteredSub.map(s => (
              <div key={s.id} onClick={() => { setSelected(s); setDetailTab('overview'); window.location.hash = `listings/sublease/${s.id}` }} className="bg-white rounded-2xl overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-200">
                <div className="relative h-44 overflow-hidden flex-shrink-0">
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-xl ${s.verified ? 'bg-[#1c1c1e] text-white' : 'bg-white/90 text-[#1c1c1e]'}`}>{s.verified ? 'Verified' : 'Student'}</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-white/90 text-[#1c1c1e]">{s.period}</span>
                  </div>
                  <div role="button" onClick={e => { e.stopPropagation(); toggleSubSave(s.id) }} className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={subSavedIds.has(s.id) ? '#1c1c1e' : 'none'} stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[16px] font-black text-white leading-none">${s.price}<span className="text-[11px] font-normal text-white/70">/mo</span></span>
                  </div>
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="text-[10px] font-medium text-white/70 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">{s.available}</span>
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="text-[14px] font-bold text-[#1c1c1e] leading-tight mb-0.5">{s.name}</p>
                  <p className="text-[11px] text-[#9ca3af] mb-3 truncate">{s.address}</p>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="flex items-center gap-1 text-[11px] text-[#6c6a66] bg-[#f5f4f0] px-2 py-1 rounded-lg">{s.beds}</span>
                    <span className="flex items-center gap-1 text-[11px] text-[#6c6a66] bg-[#f5f4f0] px-2 py-1 rounded-lg">{s.sqft}</span>
                    <span className="flex items-center gap-1 text-[11px] text-[#6c6a66] bg-[#f5f4f0] px-2 py-1 rounded-lg">{s.walkMins} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {s.amenities.slice(0, 2).map(a => <span key={a} className="text-[10px] text-[#6c6a66] bg-[#f9f8f6] border border-[#eeecea] px-2 py-0.5 rounded-lg">{a}</span>)}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-5 h-5 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-[9px] font-bold">{s.postedBy[0]}</div>
                      <span className="text-[11px] text-[#6c6a66]">{s.postedBy}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post sublease modal */}
      {showPost && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => !postSuccess && setShowPost(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg mx-6 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            {postSuccess ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#f5f4f0] flex items-center justify-center mx-auto mb-5">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="text-[17px] font-bold text-[#1c1c1e] mb-1">Sublease posted!</p>
                <p className="text-[13px] text-[#6c6a66] mb-6">Your listing is now live and visible to UIUC students.</p>
                <button onClick={() => { setShowPost(false); setPostSuccess(false) }} className="px-6 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">Done</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0efeb]">
                  <p className="text-[16px] font-bold text-[#1c1c1e]">Post a sublease</p>
                  <button onClick={() => setShowPost(false)} className="w-7 h-7 rounded-lg bg-[#f5f4f0] flex items-center justify-center hover:bg-[#e5e4e0] transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {[['Address', 'e.g. 302 E Green St, Apt 4B'], ['Price / month', 'e.g. $750'], ['Available dates', 'e.g. May 15 – Aug 15'], ['Description', 'Tell prospective renters about your place…']].map(([label, placeholder]) => (
                    <div key={label}>
                      <label className="block text-[12px] font-semibold text-[#1c1c1e] mb-1.5">{label}</label>
                      {label === 'Description'
                        ? <textarea placeholder={placeholder} className="w-full h-24 text-[13px] text-[#1c1c1e] placeholder-[#aaa] bg-[#f9f8f6] rounded-xl px-4 py-3 outline-none resize-none border border-transparent focus:border-[#e5e4e0]" />
                        : <input type="text" placeholder={placeholder} className="w-full text-[13px] text-[#1c1c1e] placeholder-[#aaa] bg-[#f9f8f6] rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#e5e4e0]" />
                      }
                    </div>
                  ))}
                  <button onClick={() => setPostSuccess(true)} className="w-full py-3 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors">Post sublease →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1c1c1e] text-white text-[13px] font-semibold px-5 py-2.5 rounded-2xl shadow-lg z-50 pointer-events-none" style={{ animation: 'fadeIn 0.15s ease' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
