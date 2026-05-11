import { listings, landlordReviews } from '../../data/listings'

interface Props {
  landlordName: string
  onBack: () => void
  onViewListing: (id: number) => void
}

function ratingColor(r: number) {
  return r >= 4.0 ? '#16a34a' : r >= 3.5 ? '#d97706' : '#dc2626'
}

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  const filled = Math.floor(rating)
  const half = rating - filled >= 0.25 && rating - filled < 0.75
  const uid = `half-${rating}-${size}`
  return (
    <svg width={size * 5 + 3 * 4} height={size} viewBox={`0 0 ${(size + 3) * 5} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={uid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor="#FBBC05" />
          <stop offset="50%" stopColor="#d1d5db" />
        </linearGradient>
      </defs>
      {[1, 2, 3, 4, 5].map((i, idx) => {
        const x = idx * (size + 3)
        const fill = i <= filled ? '#FBBC05' : i === filled + 1 && half ? `url(#${uid})` : '#d1d5db'
        const s = size
        const cx = x + s / 2
        const cy = s / 2
        const outer = s / 2
        const inner = outer * 0.4
        const pts = Array.from({ length: 10 }, (_, k) => {
          const angle = (k * Math.PI) / 5 - Math.PI / 2
          const r2 = k % 2 === 0 ? outer : inner
          return `${cx + r2 * Math.cos(angle)},${cy + r2 * Math.sin(angle)}`
        }).join(' ')
        return <polygon key={i} points={pts} fill={fill} />
      })}
    </svg>
  )
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function WebLandlordDetailScreen({ landlordName, onBack, onViewListing }: Props) {
  const rev = landlordReviews[landlordName]
  const managed = listings.filter(l => l.landlord === landlordName)
  const phone = managed[0]?.phone ?? ''

  type PlatformEntry = {
    key: 'google' | 'yelp' | 'ar'
    rating: number
    reviewCount: number
    url: string
    label: string
    quote?: string
    tags?: string[]
  }

  const platforms: PlatformEntry[] = []
  if (rev) {
    platforms.push({ key: 'google', rating: rev.rating, reviewCount: rev.reviewCount, url: rev.googleUrl, label: 'Google Reviews', quote: rev.quote, tags: rev.tags })
  }
  if (rev?.yelp) {
    platforms.push({ key: 'yelp', rating: rev.yelp.rating, reviewCount: rev.yelp.reviewCount, url: rev.yelp.url, label: 'Yelp', quote: rev.yelp.quote, tags: rev.yelp.tags })
  }
  if (rev?.apartmentRatings) {
    platforms.push({ key: 'ar', rating: rev.apartmentRatings.rating, reviewCount: rev.apartmentRatings.reviewCount, url: rev.apartmentRatings.url, label: 'ApartmentRatings', quote: rev.apartmentRatings.quote, tags: rev.apartmentRatings.tags })
  }

  // Tag color per platform
  const tagStyle = (key: PlatformEntry['key']) => {
    if (key === 'google') return 'bg-blue-50 text-blue-600'
    if (key === 'yelp')   return 'bg-red-50 text-red-500'
    return 'bg-[#f0efeb] text-[#6c6a66]'
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-[#f5f4f0]">

      {/* Top bar */}
      <div className="flex-shrink-0 px-8 pt-6 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#9ca3af] hover:text-[#1c1c1e] transition-colors text-[13px] font-semibold"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
      </div>

      {/* Two-column body */}
      <div className="flex-1 overflow-hidden flex gap-0">

        {/* LEFT — platform ratings (scrollable) */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {/* Hero */}
          <div className="flex items-center gap-4 mb-7">
            <div className="w-14 h-14 rounded-2xl bg-[#1c1c1e] flex items-center justify-center text-white text-[20px] font-bold flex-shrink-0">
              {getInitials(landlordName)}
            </div>
            <div className="min-w-0">
              <h1 className="text-[20px] font-black text-[#1c1c1e] leading-tight truncate">{landlordName}</h1>
              {phone && <p className="text-[12px] text-[#6c6a66] mt-0.5">{phone}</p>}
            </div>
          </div>

          {/* Platform Ratings */}
          {platforms.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Ratings across platforms</p>
              <div className="bg-[#f9f8f6] rounded-2xl overflow-hidden divide-y divide-[#eeede9]">
                {platforms.map(p => (
                  <a
                    key={p.key}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start hover:bg-[#f0efeb] transition-colors no-underline"
                  >
                    {/* Platform identity */}
                    <div className="w-[120px] flex-shrink-0 flex flex-col items-center justify-center gap-1.5 px-4 py-5 border-r border-[#eeede9]">
                      {p.key === 'google' && <GoogleIcon />}
                      {p.key === 'yelp' && (
                        <span className="bg-[#d32323] text-white px-2.5 py-0.5 rounded-md font-black text-[13px] leading-none">yelp</span>
                      )}
                      {p.key === 'ar' && (
                        <div className="text-center">
                          <span className="text-[10px] font-black text-[#1c1c1e] leading-tight block">Apartment</span>
                          <span className="text-[10px] font-black text-[#1c1c1e] leading-tight block">Ratings</span>
                        </div>
                      )}
                      <span className="text-[10px] text-[#9ca3af] text-center leading-snug mt-0.5">{p.label}</span>
                    </div>

                    {/* Rating content */}
                    <div className="flex-1 min-w-0 px-5 py-4">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[30px] font-black leading-none flex-shrink-0" style={{ color: ratingColor(p.rating) }}>
                          {p.rating.toFixed(1)}
                        </span>
                        <div>
                          <StarRow rating={p.rating} size={13} />
                          <p className="text-[11px] text-[#9ca3af] mt-0.5">{p.reviewCount.toLocaleString()} reviews</p>
                        </div>
                      </div>
                      {p.quote && (
                        <p className="text-[11px] text-[#6c6a66] italic leading-relaxed mb-1.5">{p.quote}</p>
                      )}
                      {p.tags && p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.tags.map(tag => (
                            <span key={tag} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagStyle(p.key)}`}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="self-center pr-4 flex-shrink-0">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c9c8c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT — company info + properties */}
        <div className="w-[320px] flex-shrink-0 overflow-y-auto border-l border-[#e5e4e0] px-6 pb-8 pt-0">

          {/* Action buttons */}
          <div className="flex flex-col gap-2 mb-6 pt-0">
            {rev?.website && (
              <a
                href={rev.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors"
              >
                Visit website
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            )}
          </div>

          {/* Managed listings */}
          {managed.length > 0 && (
            <>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">
                Managed properties ({managed.length})
              </p>
              <div className="space-y-2">
                {managed.map(l => (
                  <div
                    key={l.id}
                    className="bg-[#f9f8f6] rounded-2xl p-3 flex gap-3 cursor-pointer hover:bg-[#f0efeb] transition-colors"
                    onClick={() => onViewListing(l.id)}
                  >
                    <img src={l.img} alt={l.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-[#1c1c1e] truncate">{l.name}</p>
                      <p className="text-[10px] text-[#9ca3af] truncate mt-0.5">{l.address}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-bold text-[#1c1c1e]">${l.price.toLocaleString()}<span className="text-[10px] font-normal text-[#9ca3af]">/mo</span></span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#e5e4e0] text-[#6c6a66]">{l.beds}</span>
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9c8c4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 self-center">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
