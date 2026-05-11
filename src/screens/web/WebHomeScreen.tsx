import { useState, useEffect } from 'react'
import { listings } from '../../data/listings'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getSemester() {
  const now = new Date()
  const m = now.getMonth() + 1 // 1–12
  const y = now.getFullYear()
  if (m >= 8 && m <= 12) return `Fall ${y}`
  if (m >= 1 && m <= 5) return `Spring ${y}`
  return `Summer ${y}`
}

interface Props {
  onNavigate: (tab: string) => void
  onViewListing: (id: number) => void
}

const threads = [
  { id: 1, tag: 'Advice', tagColor: 'bg-[#f5f4f0] text-[#1c1c1e]', title: 'Best streets for Grainger students?', author: 'Emma W.', replies: 14, time: '2h ago' },
  { id: 2, tag: 'Scam Alert', tagColor: 'bg-[#1c1c1e] text-white', title: 'Watch out for fake listings on Craigslist', author: 'Marcus T.', replies: 31, time: '5h ago' },
  { id: 3, tag: 'Building Talk', tagColor: 'bg-[#f5f4f0] text-[#6c6a66]', title: 'HERE Champaign noise levels on weekends?', author: 'Priya K.', replies: 8, time: '1d ago' },
]

const messages = [
  { id: 1, name: 'Anna Smith', avatar: 'AS', color: 'bg-[#f5f4f0] text-[#1c1c1e]', msg: 'Hey! Do you have any available listings this week?', time: '11:21 AM', unread: 3 },
  { id: 2, name: 'Alex Johnson', avatar: 'AJ', color: 'bg-[#f5f4f0] text-[#1c1c1e]', msg: 'The apartment on Green St looks perfect!', time: '11:21 AM', unread: 0 },
  { id: 3, name: 'Mike Chen', avatar: 'MC', color: 'bg-[#f5f4f0] text-[#1c1c1e]', msg: 'When can I schedule a viewing?', time: '10:45 AM', unread: 1 },
]

const openDeals = [
  { id: 1, name: 'The Dean Apartments', amount: '$850/mo', status: 'Application sent' },
  { id: 2, name: 'Green Street Lofts', amount: '$720/mo', status: 'Awaiting tour' },
]

const upcomingTours = [
  {
    id: 1,
    listing: 'Green Street Lofts',
    address: '302 E Green St',
    date: 'Tue Apr 8',
    time: '11:30 AM',
    daysLeft: 4,
    img: listings[1].img,
  },
]

const quickLinks = [
  { label: 'Near Main Quad', icon: '🎓' },
  { label: 'Under $800/mo', icon: '💰' },
  { label: 'Studio apartments', icon: '🏠' },
  { label: 'Pet friendly', icon: '🐾' },
  { label: 'In-unit laundry', icon: '🫧' },
  { label: 'Available Aug 2026', icon: '📅' },
]

export default function WebHomeScreen({ onNavigate, onViewListing }: Props) {
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [toursDismissed, setToursDismissed] = useState(false)

  const featured = listings[0]
  const moreListings = listings.slice(1, 7)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSearchOpen(false); setSearch('') }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const searchResults = search.trim().length > 0
    ? listings.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.address.toLowerCase().includes(search.toLowerCase()) ||
        l.beds.toLowerCase().includes(search.toLowerCase()) ||
        l.amenities.some(a => a.toLowerCase().includes(search.toLowerCase()))
      )
    : []

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f0]">
      {/* ── Global search overlay ── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ animation: 'fadeIn 0.15s ease' }}>
          <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setSearchOpen(false); setSearch('') }} />
          {/* Search panel */}
          <div className="relative z-10 max-w-2xl w-full mx-auto mt-16 px-4">
            {/* Input */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0efeb]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search listings, areas, amenities..."
                  className="flex-1 text-[15px] text-[#1c1c1e] placeholder-[#aaa] outline-none bg-transparent"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-[#aaa] hover:text-[#6c6a66] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
                <kbd className="text-[11px] text-[#aaa] bg-[#f5f4f0] px-2 py-0.5 rounded-lg font-mono">Esc</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {search.trim() === '' ? (
                  <div className="px-5 py-4">
                    <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wide mb-3">Quick searches</p>
                    <div className="flex flex-wrap gap-2">
                      {quickLinks.map(q => (
                        <button
                          key={q.label}
                          onClick={() => setSearch(q.label)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f7f6f2] hover:bg-[#ede] rounded-xl text-[13px] text-[#1c1c1e] font-medium transition-colors"
                        >
                          <span>{q.icon}</span>{q.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wide mb-3 mt-5">Recent</p>
                    {['Green Street Lofts', 'Studio near Quad', '2BR under $900'].map(r => (
                      <button key={r} onClick={() => setSearch(r)}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-[#f7f6f2] transition-colors text-left group">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="12 8 12 12 14 14"/><circle cx="12" cy="12" r="10"/>
                        </svg>
                        <span className="text-[13px] text-[#3c3c3e]">{r}</span>
                        <svg className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    <p className="text-[11px] font-bold text-[#aaa] uppercase tracking-wide px-5 py-2">{searchResults.length} listing{searchResults.length !== 1 ? 's' : ''} found</p>
                    {searchResults.map(l => (
                      <button
                        key={l.id}
                        onClick={() => { setSearchOpen(false); setSearch(''); onViewListing(l.id); }}
                        className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f7f6f2] transition-colors text-left"
                      >
                        <img src={l.img} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-semibold text-[#1c1c1e] truncate">{l.name}</p>
                          <p className="text-[12px] text-[#6c6a66] truncate">{l.address} · {l.beds} · ${l.price}/mo</p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${l.badgeColor}`}>{l.badge}</span>
                      </button>
                    ))}
                    <div className="px-5 py-3 border-t border-[#f0efeb]">
                      <button onClick={() => { setSearchOpen(false); setSearch(''); onNavigate('explore'); }}
                        className="w-full py-2.5 bg-[#f7f6f2] hover:bg-[#e5e4e0] rounded-xl text-[13px] font-semibold text-[#6c6a66] transition-colors">
                        See all results on map →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#f5f4f0] flex items-center justify-center mb-3 text-2xl">🔍</div>
                    <p className="text-[14px] font-semibold text-[#1c1c1e]">No results for "{search}"</p>
                    <p className="text-[12px] text-[#aaa] mt-1">Try a different name, area, or amenity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top header */}
      <div className="bg-white border-b border-[#e5e4e0]">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-widest">UIUC · {getSemester()}</span>
              </div>
              <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">{getGreeting()}, LQ</h1>
              <p className="text-sm text-[#6c6a66] mt-0.5">You have 2 upcoming tours and 1 pending application</p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 pl-4 pr-4 py-2.5 bg-[#f5f4f0] hover:bg-[#ede] rounded-xl text-sm text-[#9ca3af] transition-colors w-60 border border-transparent hover:border-[#e0deda]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <span className="flex-1 text-left">Search listings...</span>
                <kbd className="text-[10px] bg-white border border-[#e5e4e0] px-1.5 py-0.5 rounded-md font-mono text-[#bbb]">⌘K</kbd>
              </button>
              <button onClick={() => onNavigate('explore')} className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1c1e] text-white text-sm font-semibold rounded-xl hover:bg-[#333] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                Explore Map
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Tour reminder banner ── */}
      {!toursDismissed && upcomingTours.length > 0 && (
        <div className="bg-[#1c1c1e]">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-4">
            <img src={upcomingTours[0].img} className="w-10 h-10 rounded-xl object-cover flex-shrink-0 ring-2 ring-white/30" />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white leading-tight">
                Tour tomorrow — <span className="text-white/70">{upcomingTours[0].listing}</span>
              </p>
              <p className="text-[11px] text-white/50 mt-0.5">{upcomingTours[0].date} at {upcomingTours[0].time} · {upcomingTours[0].address}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-center px-3 py-1 bg-white/15 rounded-xl">
                <div className="text-[18px] font-black text-white leading-none">{upcomingTours[0].daysLeft}</div>
                <div className="text-[9px] text-white/50 uppercase tracking-wide font-medium">days</div>
              </div>
              <button
                onClick={() => onNavigate('messages')}
                className="text-[12px] font-semibold text-[#1c1c1e] bg-white px-3.5 py-1.5 rounded-xl hover:bg-[#f5f4f0] transition-colors"
              >
                View thread →
              </button>
              <button
                onClick={() => setToursDismissed(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-3 gap-5">
          {/* Left 2 cols */}
          <div className="col-span-2 space-y-5">

            {/* Apartments section */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-4">
                <div>
                  <h2 className="font-bold text-[#1c1c1e] flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                    Recommended for you
                  </h2>
                  <p className="text-[11px] text-[#9ca3af] mt-0.5">Based on your saved preferences</p>
                </div>
                <div className="flex items-center gap-2">
                  <select className="text-xs border border-[#e5e4e0] rounded-lg px-2 py-1.5 text-[#1c1c1e] bg-white outline-none">
                    <option>Best Match</option>
                    <option>Price: Low</option>
                    <option>Price: High</option>
                  </select>
                  <button onClick={() => onNavigate('explore')} className="text-xs text-[#6c6a66] border border-[#e5e4e0] px-3 py-1.5 rounded-lg hover:border-[#1c1c1e] hover:text-[#1c1c1e] transition-colors">See all →</button>
                </div>
              </div>

              {/* Hero photo + 2 stacked thumbnails */}
              <div className="flex gap-2 px-5 mb-4 h-52">
                <div onClick={() => onViewListing(featured.id)} className="flex-[3] relative rounded-2xl overflow-hidden cursor-pointer group">
                  <img src={featured.img} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${featured.badgeColor}`}>{featured.badge}</span>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                    </div>
                    <span className="text-[11px] text-white font-medium">{featured.address}</span>
                  </div>
                </div>
                <div className="flex-[1.2] flex flex-col gap-2">
                  {[listings[1], listings[2]].map(l => (
                    <div key={l.id} onClick={() => onViewListing(l.id)} className="flex-1 relative rounded-2xl overflow-hidden cursor-pointer group">
                      <img src={l.img} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 pb-5">
                {/* Name + Price */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[17px] font-bold text-[#1c1c1e] leading-tight">{featured.name}</h3>
                    <p className="text-[13px] text-[#6c6a66] mt-0.5">{featured.address}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-[#1c1c1e]">${featured.price}</span>
                      <span className="text-sm text-[#9ca3af]">/mo</span>
                    </div>
                    <p className="text-[10px] text-[#6c6a66] font-semibold mt-0.5">$50 below avg</p>
                  </div>
                </div>

                {/* Specs row — SVG icons */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span className="flex items-center gap-1.5 text-[12px] text-[#6c6a66] bg-[#f5f4f0] px-3 py-1.5 rounded-xl">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 9h20"/><path d="M2 9v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9"/><line x1="12" y1="9" x2="12" y2="20"/></svg>
                    {featured.beds}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-[#6c6a66] bg-[#f5f4f0] px-3 py-1.5 rounded-xl">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                    {featured.sqft}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-[#6c6a66] bg-[#f5f4f0] px-3 py-1.5 rounded-xl">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
                    {featured.floor}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-[#6c6a66] bg-[#f5f4f0] px-3 py-1.5 rounded-xl">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {featured.available}
                  </span>
                </div>

                {/* CTA + Agent row */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f0efeb]">
                <div className="flex items-center gap-2">
                  <button onClick={() => onViewListing(featured.id)} className="px-5 py-2.5 bg-[#1c1c1e] text-white text-sm font-semibold rounded-xl hover:bg-[#2c2c2e] transition-colors">
                    View details
                  </button>
                  <button onClick={() => onNavigate('explore')} className="w-9 h-9 rounded-xl border border-[#e5e4e0] flex items-center justify-center text-[#6c6a66] hover:bg-[#f5f4f0]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </button>
                  <button className="w-9 h-9 rounded-xl border border-[#e5e4e0] flex items-center justify-center text-[#6c6a66] hover:bg-[#f5f4f0]">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-[#9ca3af]">Property manager</p>
                    <p className="text-sm font-semibold text-[#1c1c1e]">{featured.landlord}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {featured.landlord.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="w-9 h-9 rounded-xl border border-[#e5e4e0] flex items-center justify-center text-[#6c6a66] hover:bg-[#f5f4f0]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </button>
                    <button className="w-9 h-9 rounded-xl border border-[#e5e4e0] flex items-center justify-center text-[#6c6a66] hover:bg-[#f5f4f0]">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>

            {/* More listings — Agile CRM "Developers" style */}
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1c1c1e] flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  More listings
                </h2>
                <button onClick={() => onNavigate('explore')} className="text-xs text-[#6c6a66] border border-[#e5e4e0] px-3 py-1.5 rounded-lg hover:border-[#1c1c1e] hover:text-[#1c1c1e] transition-colors">See all on map →</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {moreListings.slice(0, 3).map((l, i) => (
                  <div
                    key={l.id}
                    onClick={() => onViewListing(l.id)}
                    className={`cursor-pointer rounded-2xl p-3 transition-all hover:shadow-sm ${i === 0 ? 'bg-[#1c1c1e]' : 'bg-[#f9f8f6] hover:bg-[#f5f4f0]'}`}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <img src={l.img} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${i === 0 ? 'text-white' : 'text-[#1c1c1e]'}`}>{l.name}</p>
                        <p className={`text-[10px] truncate mt-0.5 ${i === 0 ? 'text-white/50' : 'text-[#9ca3af]'}`}>{l.address}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] mb-2.5 ${i === 0 ? 'text-white/50' : 'text-[#9ca3af]'}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                      <span>{l.beds} · {l.sqft}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-[12px] font-black ${i === 0 ? 'text-white' : 'text-[#1c1c1e]'}`}>${l.price}/mo</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${i === 0 ? 'bg-white/20' : 'bg-[#e5e4e0]'}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={i === 0 ? 'white' : '#6c6a66'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Deals + Messages — Agile CRM style */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1c1c1e] flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                    Open Deals
                  </h2>
                  <button onClick={() => onNavigate('explore')} className="text-xs text-[#6c6a66] hover:text-[#1c1c1e] transition-colors">See all →</button>
                </div>
                <div className="space-y-2.5">
                  {openDeals.map(deal => (
                    <div key={deal.id} className="flex items-center gap-3 p-3 bg-[#f9f8f6] rounded-xl hover:bg-[#f5f4f0] cursor-pointer transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1c1c1e] truncate">{deal.name}</p>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full inline-block mt-0.5 bg-[#f5f4f0] text-[#6c6a66]">{deal.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-bold text-[#1c1c1e]">{deal.amount}</span>
                        <div className="w-5 h-5 rounded-full bg-[#1c1c1e] flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-[#1c1c1e] flex items-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Messages
                  </h2>
                  <button onClick={() => onNavigate('messages')} className="text-xs text-[#6c6a66] hover:text-[#1c1c1e] transition-colors">See all →</button>
                </div>
                <div className="space-y-2">
                  {messages.map(msg => (
                    <div key={msg.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f5f4f0] cursor-pointer transition-colors">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.color}`}>
                        {msg.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-[#1c1c1e]">{msg.name}</p>
                          <span className="text-[9px] text-[#9ca3af]">{msg.time}</span>
                        </div>
                        <p className="text-[10px] text-[#6c6a66] truncate mt-0.5">{msg.msg}</p>
                      </div>
                      {msg.unread > 0 && (
                        <div className="w-5 h-5 rounded-full bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] text-white font-bold">{msg.unread}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Upcoming Tours card */}
            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Upcoming Tours
                </h2>
                <button onClick={() => onNavigate('messages')} className="text-[11px] text-white/50 hover:text-white transition-colors">View all →</button>
              </div>
              {upcomingTours.map(t => (
                <div key={t.id} className="flex items-center gap-3 mb-3 last:mb-0">
                  <img src={t.img} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{t.listing}</p>
                    <p className="text-[11px] text-white/50 mt-0.5">{t.date} · {t.time}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] font-bold text-white/60 bg-white/15 px-2 py-0.5 rounded-full block mb-1">
                      {t.daysLeft}d away
                    </span>
                    <button
                      onClick={() => onNavigate('messages')}
                      className="text-[10px] font-semibold text-white/60 hover:text-white transition-colors"
                    >
                      Message →
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <p className="text-[11px] text-white/50">Landlord responded 2h ago</p>
                <button onClick={() => onNavigate('messages')} className="ml-auto text-[11px] font-semibold text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors">
                  Reply
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#1c1c1e]">Community</h2>
                <button onClick={() => onNavigate('community')} className="text-xs text-[#6c6a66] hover:text-[#1c1c1e] transition-colors">See all →</button>
              </div>
              <div className="space-y-4">
                {threads.map(t => (
                  <div key={t.id} className="cursor-pointer group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.tagColor}`}>{t.tag}</span>
                      <span className="text-xs text-[#6c6a66]">{t.time}</span>
                    </div>
                    <p className="text-sm font-medium text-[#1c1c1e] leading-snug group-hover:underline">{t.title}</p>
                    <p className="text-xs text-[#6c6a66] mt-1">{t.author} · {t.replies} replies</p>
                  </div>
                ))}
              </div>
              <button onClick={() => onNavigate('community')} className="w-full mt-4 py-2.5 rounded-xl border border-[#e5e4e0] text-sm text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors">
                Ask a question
              </button>
            </div>

            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[#1c1c1e]">Sublease Spotlight</h2>
                <button onClick={() => onNavigate('sublease')} className="text-xs text-[#6c6a66] hover:text-[#1c1c1e] transition-colors">See all →</button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Studio on Green St', price: 680, period: 'Summer', verified: true },
                  { name: '1BR near Grainger', price: 790, period: 'Spring', verified: true },
                  { name: '2BR Chalmers', price: 950, period: 'Fall', verified: false },
                ].map((s, i) => (
                  <div key={i} onClick={() => onNavigate('sublease')} className="flex items-center justify-between cursor-pointer hover:bg-[#f5f4f0] rounded-xl p-2 -mx-2 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#1c1c1e]">{s.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-[#6c6a66]">{s.period}</span>
                        {s.verified && <span className="text-xs text-[#6c6a66] font-medium">✓ Verified</span>}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-[#1c1c1e]">${s.price}/mo</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1c1c1e] rounded-2xl p-5">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">Market snapshot</p>
              <div className="space-y-3">
                {[
                  { label: 'Avg. rent near campus', value: '$810/mo' },
                  { label: 'Listings available', value: '8 units' },
                  { label: 'Avg. walk to Grainger', value: '11 min' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">{stat.label}</span>
                    <span className="text-white text-sm font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
