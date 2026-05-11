import { useState } from 'react'
import { listings, landlordReviews } from '../../data/listings'

interface Props {
  savedIds: Set<number>
  onToggleSave: (id: number) => void
  onViewListing: (id: number) => void
  onNavigate: (tab: string) => void
}

function ratingColor(r: number) {
  return r >= 4.0 ? '#16a34a' : r >= 3.5 ? '#d97706' : '#dc2626'
}

export default function WebSavedScreen({ savedIds, onToggleSave, onViewListing, onNavigate }: Props) {
  const savedListings = listings.filter(l => savedIds.has(l.id))
  const [compareMode, setCompareMode] = useState(false)
  const [compareIds, setCompareIds] = useState<Set<number>>(new Set())
  const [showCompare, setShowCompare] = useState(false)

  const toggleCompare = (id: number) => {
    setCompareIds(prev => {
      const n = new Set(prev)
      if (n.has(id)) { n.delete(id); return n }
      if (n.size >= 3) return prev
      n.add(id); return n
    })
  }

  const exitCompare = () => {
    setCompareMode(false)
    setCompareIds(new Set())
    setShowCompare(false)
  }

  const compareListings = listings.filter(l => compareIds.has(l.id))

  // Best-value helpers
  const minPrice = Math.min(...compareListings.map(l => l.price))
  const maxSqft  = Math.max(...compareListings.map(l => parseInt(l.sqft)))
  const minWalk  = Math.min(...compareListings.map(l => Math.min(...Object.values(l.walkFrom))))
  const maxRating = Math.max(...compareListings.map(l => landlordReviews[l.landlord]?.rating ?? 0))

  if (showCompare && compareListings.length >= 2) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#f5f4f0]">
        {/* Header */}
        <div className="bg-white border-b border-[#e5e4e0] sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={exitCompare}
                className="flex items-center gap-1.5 text-[#9ca3af] hover:text-[#1c1c1e] transition-colors text-[13px] font-semibold"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back to Saved
              </button>
            </div>
            <h2 className="text-[15px] font-bold text-[#1c1c1e]">Comparing {compareListings.length} listings</h2>
            <div className="w-24" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-6">
          {/* Listing header columns */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `180px repeat(${compareListings.length}, 1fr)` }}>
            <div /> {/* row label spacer */}
            {compareListings.map(l => (
              <div
                key={l.id}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onViewListing(l.id)}
              >
                <div className="relative h-36 overflow-hidden">
                  <img src={l.img} alt={l.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2.5">
                    <span className="text-[15px] font-black text-white">${l.price.toLocaleString()}<span className="text-[10px] font-normal text-white/70">/mo</span></span>
                  </div>
                </div>
                <div className="px-3 py-2.5">
                  <p className="text-[13px] font-bold text-[#1c1c1e] truncate">{l.name}</p>
                  <p className="text-[11px] text-[#9ca3af] truncate">{l.address}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          {[
            {
              label: 'Monthly Rent',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
              render: (l: typeof listings[0]) => {
                const best = l.price === minPrice
                return <span className={`text-[14px] font-bold ${best ? 'text-[#16a34a]' : 'text-[#1c1c1e]'}`}>
                  ${l.price.toLocaleString()}/mo
                  {best && <span className="ml-1.5 text-[10px] font-semibold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">Lowest</span>}
                </span>
              }
            },
            {
              label: 'Unit Type',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 9h20"/><path d="M2 9v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9"/><line x1="12" y1="9" x2="12" y2="20"/></svg>,
              render: (l: typeof listings[0]) => <span className="text-[13px] text-[#1c1c1e] font-semibold">{l.beds}</span>
            },
            {
              label: 'Size',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>,
              render: (l: typeof listings[0]) => {
                const n = parseInt(l.sqft)
                const best = n === maxSqft
                return <span className={`text-[13px] font-semibold ${best ? 'text-[#16a34a]' : 'text-[#1c1c1e]'}`}>
                  {l.sqft}
                  {best && <span className="ml-1.5 text-[10px] font-semibold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">Largest</span>}
                </span>
              }
            },
            {
              label: 'Walk to Campus',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
              render: (l: typeof listings[0]) => {
                const w = Math.min(...Object.values(l.walkFrom))
                const best = w === minWalk
                return <span className={`text-[13px] font-semibold ${best ? 'text-[#16a34a]' : 'text-[#1c1c1e]'}`}>
                  {w} min
                  {best && <span className="ml-1.5 text-[10px] font-semibold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">Closest</span>}
                </span>
              }
            },
            {
              label: 'Available',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
              render: (l: typeof listings[0]) => <span className="text-[13px] text-[#1c1c1e] font-semibold">{l.available}</span>
            },
            {
              label: 'Amenities',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>,
              render: (l: typeof listings[0]) => (
                <div className="flex flex-wrap gap-1">
                  {l.amenities.slice(0, 5).map(a => (
                    <span key={a} className="text-[10px] text-[#6c6a66] bg-[#f5f4f0] px-2 py-0.5 rounded-lg">{a}</span>
                  ))}
                  {l.amenities.length > 5 && <span className="text-[10px] text-[#9ca3af]">+{l.amenities.length - 5} more</span>}
                </div>
              )
            },
            {
              label: 'Landlord',
              icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
              render: (l: typeof listings[0]) => {
                const rev = landlordReviews[l.landlord]
                const best = rev && rev.rating === maxRating && maxRating > 0
                return (
                  <div>
                    <p className="text-[12px] font-semibold text-[#1c1c1e] mb-0.5">{l.landlord}</p>
                    {rev && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold" style={{ color: ratingColor(rev.rating) }}>{rev.rating.toFixed(1)}</span>
                        <span className="text-[10px] text-[#9ca3af]">({rev.reviewCount} reviews)</span>
                        {best && <span className="text-[10px] font-semibold bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">Top rated</span>}
                      </div>
                    )}
                  </div>
                )
              }
            },
          ].map(row => (
            <div
              key={row.label}
              className="grid gap-4 items-start py-4 border-b border-[#e5e4e0] last:border-0"
              style={{ gridTemplateColumns: `180px repeat(${compareListings.length}, 1fr)` }}
            >
              {/* Row label */}
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider pt-0.5">
                <span className="text-[#c9c8c4]">{row.icon}</span>
                {row.label}
              </div>
              {compareListings.map(l => (
                <div key={l.id} className="bg-white rounded-xl px-3.5 py-3">
                  {row.render(l)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f0]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e4e0]">
        <div className="max-w-6xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Saved</h1>
              <p className="text-sm text-[#6c6a66] mt-0.5">
                {savedListings.length === 0
                  ? 'No saved listings yet'
                  : `${savedListings.length} saved listing${savedListings.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {savedListings.length >= 2 && (
                <button
                  onClick={() => { setCompareMode(!compareMode); setCompareIds(new Set()); }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors ${compareMode ? 'bg-[#1c1c1e] text-white' : 'bg-[#f5f4f0] text-[#1c1c1e] hover:bg-[#eeede9]'}`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/>
                  </svg>
                  {compareMode ? 'Cancel' : 'Compare'}
                </button>
              )}
              {savedListings.length > 0 && !compareMode && (
                <button
                  onClick={() => savedListings.forEach(l => onToggleSave(l.id))}
                  className="text-[13px] text-[#9ca3af] hover:text-[#1c1c1e] transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          {/* Compare hint */}
          {compareMode && (
            <p className="text-[12px] text-[#9ca3af] mt-2">
              Select 2–3 listings to compare · {compareIds.size} selected
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {savedListings.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p className="text-[16px] font-semibold text-[#1c1c1e] mb-1">No saved listings yet</p>
            <p className="text-[13px] text-[#9ca3af] mb-6">Tap the heart icon on any listing to save it here</p>
            <div className="flex gap-3">
              <button onClick={() => onNavigate('listings')} className="px-5 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#2c2c2e] transition-colors">
                Browse Listings
              </button>
              <button onClick={() => onNavigate('explore')} className="px-5 py-2.5 bg-white text-[#1c1c1e] text-[13px] font-semibold rounded-xl border border-[#e5e4e0] hover:bg-[#f5f4f0] transition-colors">
                Explore Map
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {savedListings.map(l => {
              const selected = compareIds.has(l.id)
              return (
                <div
                  key={l.id}
                  onClick={() => compareMode ? toggleCompare(l.id) : onViewListing(l.id)}
                  className={`bg-white rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 ${
                    compareMode
                      ? selected ? 'ring-2 ring-[#1c1c1e] shadow-md' : 'opacity-70 hover:opacity-100'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="relative h-44 overflow-hidden flex-shrink-0">
                    <img src={l.img} alt={l.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Compare checkbox overlay */}
                    {compareMode && (
                      <div className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${selected ? 'bg-[#1c1c1e]' : 'bg-white/80'}`}>
                        {selected
                          ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : <div className="w-3.5 h-3.5 rounded-full border-2 border-[#9ca3af]" />
                        }
                      </div>
                    )}

                    {!compareMode && (
                      <>
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-xl ${l.badge === 'Verified' ? 'bg-[#1c1c1e] text-white' : 'bg-white/90 text-[#1c1c1e]'}`}>
                            {l.badge}
                          </span>
                        </div>
                        <div
                          role="button"
                          onClick={e => { e.stopPropagation(); onToggleSave(l.id); }}
                          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                          title="Remove from saved"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#1c1c1e" stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </div>
                      </>
                    )}

                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[16px] font-black text-white leading-none">
                        ${l.price.toLocaleString()}<span className="text-[11px] font-normal text-white/70">/mo</span>
                      </span>
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
                      {l.amenities.slice(0, 3).map(a => (
                        <span key={a} className="text-[10px] text-[#6c6a66] bg-[#f9f8f6] border border-[#eeecea] px-2 py-0.5 rounded-lg">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Sticky compare bar */}
      {compareMode && compareIds.size >= 2 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#1c1c1e] text-white text-[14px] font-bold rounded-2xl shadow-2xl hover:bg-[#333] transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/>
            </svg>
            Compare {compareIds.size} listings
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
