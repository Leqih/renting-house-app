import { listings } from '../../data/listings'

interface Props {
  savedIds: Set<number>
  onToggleSave: (id: number) => void
  onViewListing: (id: number) => void
  onNavigate: (tab: string) => void
}

export default function WebSavedScreen({ savedIds, onToggleSave, onViewListing, onNavigate }: Props) {
  const savedListings = listings.filter(l => savedIds.has(l.id))

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
            {savedListings.length > 0 && (
              <button
                onClick={() => savedListings.forEach(l => onToggleSave(l.id))}
                className="text-[13px] text-[#9ca3af] hover:text-[#1c1c1e] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {savedListings.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-5 shadow-sm">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <p className="text-[16px] font-semibold text-[#1c1c1e] mb-1">No saved listings yet</p>
            <p className="text-[13px] text-[#9ca3af] mb-6">Tap the heart icon on any listing to save it here</p>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('listings')}
                className="px-5 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#2c2c2e] transition-colors"
              >
                Browse Listings
              </button>
              <button
                onClick={() => onNavigate('explore')}
                className="px-5 py-2.5 bg-white text-[#1c1c1e] text-[13px] font-semibold rounded-xl border border-[#e5e4e0] hover:bg-[#f5f4f0] transition-colors"
              >
                Explore Map
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {savedListings.map(l => (
              <div
                key={l.id}
                onClick={() => onViewListing(l.id)}
                className="bg-white rounded-2xl overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-200"
              >
                {/* Photo */}
                <div className="relative h-44 overflow-hidden flex-shrink-0">
                  <img
                    src={l.img}
                    alt={l.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Badge top-left */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-xl ${l.badge === 'Verified' ? 'bg-[#1c1c1e] text-white' : 'bg-white/90 text-[#1c1c1e]'}`}>
                      {l.badge}
                    </span>
                  </div>

                  {/* Unsave button top-right */}
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

                  {/* Price bottom-left */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <span className="text-[16px] font-black text-white leading-none">
                      ${l.price}<span className="text-[11px] font-normal text-white/70">/mo</span>
                    </span>
                  </div>

                  {/* Available bottom-right */}
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="text-[10px] font-medium text-white/70 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                      {l.available}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-3.5">
                  <p className="text-[14px] font-bold text-[#1c1c1e] leading-tight mb-0.5">{l.name}</p>
                  <p className="text-[11px] text-[#9ca3af] mb-3 truncate">{l.address}</p>

                  {/* Specs row */}
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

                  {/* Amenity chips */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {l.amenities.slice(0, 3).map(a => (
                      <span key={a} className="text-[10px] text-[#6c6a66] bg-[#f9f8f6] border border-[#eeecea] px-2 py-0.5 rounded-lg">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
