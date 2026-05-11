import { useState } from 'react'
import type { Listing } from '../../data/listings'
import { listings } from '../../data/listings'

const colleges = [
  { id: 'eng',  short: 'Grainger Engineering', full: 'Grainger College of Engineering' },
  { id: 'bus',  short: 'Gies Business',         full: 'Gies College of Business' },
  { id: 'las',  short: 'LAS',                   full: 'College of Liberal Arts & Sciences' },
  { id: 'agr',  short: 'ACES',                  full: 'College of ACES' },
  { id: 'med',  short: 'Media',                 full: 'College of Media' },
  { id: 'art',  short: 'FAA',                   full: 'College of Fine & Applied Arts' },
]

const amenityIcons: Record<string, string> = {
  'In-unit laundry': '🫧', 'Rooftop deck': '🏙️', 'Gym': '💪', 'Study rooms': '📖',
  'Pet friendly': '🐾', 'Bike storage': '🚲', 'Package lockers': '📦', 'High-speed Wi-Fi': '📶',
  'Hardwood floors': '🪵', 'Exposed brick': '🧱', 'Updated kitchen': '🍳', 'Rooftop access': '🌇',
  'Coin laundry': '🪙', 'Near bus stop': '🚌', 'Resort pool': '🏊', 'Private study pods': '🎧',
  'Fully furnished option': '🛋️', 'Concierge': '🛎️', 'Rooftop sky lounge': '✨', 'EV charging': '⚡',
  'Dog wash station': '🐕', 'Yoga studio': '🧘', 'Quiet floors': '🔇', 'Study lounge': '📚',
  'Laundry in building': '🧺', 'Courtyard': '🌿', 'Near Quad': '🎓', 'MTD bus stop': '🚌',
}

const listingReviews: Record<number, { author: string; college: string; semester: string; rating: number; text: string }[]> = {
  1: [
    { author: 'Alex T.', college: 'Grainger', semester: 'Fall 2025', rating: 5, text: 'Rooftop lounge is amazing during finals week. Super quiet building, management replies same day. 10/10 would renew.' },
    { author: 'Priya S.', college: 'Gies', semester: 'Spring 2025', rating: 4, text: 'Great location and in-unit laundry is a game changer. A little pricey but worth it for the convenience.' },
  ],
  2: [
    { author: 'Jordan L.', college: 'LAS', semester: 'Fall 2025', rating: 5, text: 'Best deal on Green St. Literally walk out the door to everything. Exposed brick is so aesthetic.' },
    { author: 'Maya R.', college: 'Media', semester: 'Fall 2024', rating: 4, text: 'Super affordable and solid. Coin laundry is the only downside but honestly not a big deal.' },
  ],
  3: [{ author: 'Chris M.', college: 'Gies', semester: 'Spring 2026', rating: 5, text: 'The pool and sky lounge genuinely feel like a resort. Study pods are always available.' }, { author: 'Sarah K.', college: 'Grainger', semester: 'Fall 2025', rating: 4, text: 'Premium price but you get what you pay for.' }],
  4: [{ author: 'David N.', college: 'LAS', semester: 'Fall 2025', rating: 5, text: 'Literally 4 min from Lincoln Hall. Never been late to class.' }, { author: 'Emma W.', college: 'FAA', semester: 'Spring 2025', rating: 4, text: 'Great community vibe and close to Krannert.' }],
  5: [{ author: 'Tyler B.', college: 'Grainger', semester: 'Fall 2025', rating: 5, text: 'Can\'t beat the price. Responsive landlord and fast internet.' }, { author: 'Lena H.', college: 'Media', semester: 'Spring 2025', rating: 4, text: 'Small but cozy. Goodwin Ave location is super convenient.' }],
  6: [{ author: 'Omar F.', college: 'FAA', semester: 'Fall 2025', rating: 5, text: 'Me and my roommate split this 2B2B and it\'s been perfect. Balcony is great for summer.' }, { author: 'Nina C.', college: 'LAS', semester: 'Spring 2026', rating: 4, text: 'Spacious and modern. Underground parking is so clutch in winter.' }],
  7: [{ author: 'Sam P.', college: 'Gies', semester: 'Fall 2025', rating: 5, text: 'Super calm street, feels safe at night. Utilities included means no bill surprises.' }, { author: 'Rachel T.', college: 'ACES', semester: 'Fall 2024', rating: 4, text: 'Renovated kitchen is really nice. Quiet neighborhood.' }],
  8: [{ author: 'Jake H.', college: 'ACES', semester: 'Spring 2025', rating: 5, text: 'Perfect for a grad student. Huge yard, parking included, management is on-site.' }, { author: 'Mia L.', college: 'Media', semester: 'Fall 2024', rating: 4, text: 'Spacious place near the research park. Pet-friendly and the yard is great for my dog.' }],
}

// Neighborhood → community search query + relevant post previews
const neighborhoodCommunity: Record<string, {
  searchQuery: string
  posts: { title: string; author: string; flair: string; preview: string; votes: number }[]
}> = {
  first: {
    searchQuery: 'First St',
    posts: [
      { title: 'Best streets for Grainger students? First St vs. Green St vs. Chalmers', author: 'Emma_W', flair: 'Advice', preview: 'First St seems close but is it worth the price premium? Green St seems fun but noisy. Chalmers feels off the beaten path…', votes: 124 },
      { title: 'Green Street Properties landlord review — 4/5 stars', author: 'Alex_R', flair: 'Reviews', preview: 'Lived at The Dean Apartments for 2 years. Maintenance is fast, usually same day. Lease renewal process is painless…', votes: 45 },
    ],
  },
  green: {
    searchQuery: 'Green Street',
    posts: [
      { title: 'HERE Champaign noise levels on weekends — honest review after 1 year', author: 'Priya_K', flair: 'Building Talk', preview: 'It\'s loud Friday and Saturday nights, especially floors 3–7. That said, the amenities (pool, study pods) are legitimately good…', votes: 88 },
      { title: 'South Champaign vs. Green Street — honest pros/cons after living in both', author: 'Jordan_L', flair: 'Area Insight', preview: 'Green St: walkable, social, expensive, noisy. South Campus: cheaper, quieter, need a bike…', votes: 67 },
    ],
  },
  chalmers: {
    searchQuery: 'Chalmers',
    posts: [
      { title: 'Best streets for Grainger students? First St vs. Green St vs. Chalmers', author: 'Emma_W', flair: 'Advice', preview: 'Chalmers feels off the beaten path. Would love to hear from people who\'ve lived in each area…', votes: 124 },
      { title: 'South Champaign vs. Green Street — honest pros/cons after living in both', author: 'Jordan_L', flair: 'Area Insight', preview: 'Undergrads who want the college experience — Green St is worth it. For quiet and cheap, Chalmers is underrated…', votes: 67 },
    ],
  },
  south: {
    searchQuery: 'South Campus',
    posts: [
      { title: 'South Champaign vs. Green Street — honest pros/cons after living in both', author: 'Jordan_L', flair: 'Area Insight', preview: 'South Campus: cheaper, quieter, need a bike. For grad students South is better…', votes: 67 },
      { title: 'How early should I start looking for fall 2026 apartments?', author: 'Shawn_P', flair: 'Advice', preview: 'I keep hearing that Champaign apartments go fast. Are there still decent options in January/February?', votes: 93 },
    ],
  },
  quad: {
    searchQuery: 'Quad',
    posts: [
      { title: 'How early should I start looking for fall 2026 apartments?', author: 'Shawn_P', flair: 'Advice', preview: 'I keep hearing that Champaign apartments go fast. Is it really necessary to sign a lease in October for August move-in?', votes: 93 },
      { title: 'Best streets for Grainger students? First St vs. Green St vs. Chalmers', author: 'Emma_W', flair: 'Advice', preview: 'Engineering quad is my main building. First St seems close but is it worth the price premium?', votes: 124 },
    ],
  },
}

const tourDates = [
  { label: 'Mon', date: 'Apr 7' }, { label: 'Tue', date: 'Apr 8' },
  { label: 'Wed', date: 'Apr 9' }, { label: 'Thu', date: 'Apr 10' },
  { label: 'Fri', date: 'Apr 11' }, { label: 'Mon', date: 'Apr 14' },
  { label: 'Tue', date: 'Apr 15' },
]
const tourTimes = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM']

interface Props {
  listing: Listing
  onBack: () => void
  selectedCollegeId?: string | null
  onNavigate?: (tab: string, search?: string) => void
  onViewOnMap?: (id: number) => void
  onTabChange?: (tab: string) => void
  onApplyStep?: (step: string) => void
}

type Tab = 'overview' | 'walk' | 'amenities' | 'reviews' | 'apply'

export default function WebListingDetailScreen({ listing, onBack, selectedCollegeId, onNavigate, onViewOnMap, onTabChange, onApplyStep }: Props) {
  const [saved, setSaved] = useState(false)
  const [photoIdx, setPhotoIdx] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const switchTab = (t: Tab) => { setActiveTab(t); onTabChange?.(t); }
  const switchApplyStep = (s: 'tour' | 'info' | 'done') => { setApplyStep(s); onApplyStep?.(s); }
  const [applyStep, setApplyStep] = useState<'tour' | 'info' | 'done'>('tour')
  const [tourDate, setTourDate] = useState('')
  const [tourTime, setTourTime] = useState('')
  const [applyName, setApplyName] = useState('')
  const [applyEmail, setApplyEmail] = useState('')
  const [applyNetid, setApplyNetid] = useState('')
  const [applyNote, setApplyNote] = useState('')

  const reviews = listingReviews[listing.id] ?? []
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
  const galleryPhotos = [listing.img, ...listings.filter(l => l.id !== listing.id).slice(0, 3).map(l => l.img)]

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'walk', label: 'Walk Times' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'apply', label: 'Apply' },
  ]

  return (
    <div className="flex flex-col flex-1 overflow-hidden bg-[#f7f6f2]" style={{ animation: 'fadeIn 0.18s ease' }}>
      <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>

      {/* ── Top: Photo section ── */}
      <div className="relative flex-shrink-0 flex flex-col" style={{ height: '42%' }}>

        {/* Main photo */}
        <div className="flex-1 relative overflow-hidden">
          <img
            src={galleryPhotos[photoIdx]}
            alt={listing.name}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Back + Save overlay */}
          <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-[13px] font-semibold text-[#1c1c1e] shadow-sm hover:bg-white transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back
            </button>
            <div className="flex items-center gap-2">
              {avgRating && (
                <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-[13px] font-semibold text-[#1c1c1e] shadow-sm">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#1c1c1e" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {avgRating}
                </div>
              )}
              <button
                onClick={() => setSaved(s => !s)}
                className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm hover:bg-white transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? '#1c1c1e' : 'none'} stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Photo counter */}
          <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            {photoIdx + 1} / {galleryPhotos.length}
          </div>

          {/* Prev/Next arrows */}
          {photoIdx > 0 && (
            <button onClick={() => setPhotoIdx(i => i - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          )}
          {photoIdx < galleryPhotos.length - 1 && (
            <button onClick={() => setPhotoIdx(i => i + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white transition-colors shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          )}
        </div>

        {/* Thumbnail strip + info bar */}
        <div className="bg-[#1c1c1e] flex-shrink-0 flex items-center gap-3 px-5 py-3">
          {/* Thumbnails */}
          <div className="flex gap-1.5 flex-shrink-0">
            {galleryPhotos.map((img, i) => (
              <button
                key={i}
                onClick={() => setPhotoIdx(i)}
                className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 transition-all ${photoIdx === i ? 'ring-2 ring-white ring-offset-1 ring-offset-[#1c1c1e]' : 'opacity-40 hover:opacity-70'}`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-white/15 flex-shrink-0" />

          {/* Listing name + address */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-[16px] font-bold text-white truncate">{listing.name}</h1>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${listing.badgeColor}`}>{listing.badge}</span>
            </div>
            <p className="text-[12px] text-white/50 truncate">{listing.address}, Champaign, IL</p>
          </div>

          {/* Price */}
          <div className="flex-shrink-0 text-right">
            <p className="text-[22px] font-black text-white leading-none">${listing.price.toLocaleString()}</p>
            <p className="text-[11px] text-white/40 mt-0.5">per month</p>
          </div>
        </div>
      </div>

      {/* ── Bottom: Detail panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white border-t border-[#e5e4e0]">

        {/* Specs row + tab bar */}
        <div className="px-6 pt-4 pb-0 flex-shrink-0">
          {/* Key specs */}
          <div className="flex gap-2 mb-4">
            <div className="flex items-center gap-1.5 bg-[#f7f6f2] rounded-xl px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><path d="M2 9h20"/><path d="M2 9v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9"/><line x1="12" y1="9" x2="12" y2="20"/></svg>
              <span className="text-[12px] font-semibold text-[#1c1c1e]">{listing.beds}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f7f6f2] rounded-xl px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
              <span className="text-[12px] font-semibold text-[#1c1c1e]">{listing.sqft}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f7f6f2] rounded-xl px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
              <span className="text-[12px] font-semibold text-[#1c1c1e]">{listing.floor}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#f7f6f2] rounded-xl px-3 py-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6c6a66" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="text-[12px] font-semibold text-[#1c1c1e]">{listing.available}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {(onViewOnMap || onNavigate) && (
                <button
                  onClick={() => onViewOnMap ? onViewOnMap(listing.id) : (onBack(), onNavigate!('explore'))}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#f5f4f0] text-[#1c1c1e] text-[12px] font-semibold rounded-xl hover:bg-[#e5e4e0] transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                  </svg>
                  View on map
                </button>
              )}
              <button onClick={() => switchTab('apply')} className="px-4 py-2 bg-[#f5f4f0] text-[#1c1c1e] text-[12px] font-semibold rounded-xl hover:bg-[#e5e4e0] transition-colors">Schedule Tour</button>
              <button onClick={() => switchTab('apply')} className="px-4 py-2 bg-[#1c1c1e] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-colors">Apply Now →</button>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-[#f0efeb] gap-5">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`py-2.5 text-[13px] font-semibold whitespace-nowrap border-b-2 -mb-px transition-all ${
                  activeTab === t.id
                    ? 'border-[#1c1c1e] text-[#1c1c1e]'
                    : 'border-transparent text-[#9ca3af] hover:text-[#1c1c1e]'
                } ${t.id === 'apply' ? 'ml-auto' : ''}`}
              >
                {t.id === 'apply' ? (
                  <span className={`px-3 py-1 rounded-lg text-[12px] ${activeTab === 'apply' ? 'bg-[#1c1c1e] text-white' : 'bg-[#f5f4f0] text-[#1c1c1e]'}`}>Apply Now</span>
                ) : t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <p className="text-[14px] text-[#3c3c3e] leading-relaxed">{listing.desc}</p>

              <div className="grid grid-cols-2 gap-6">
                {/* Quick facts */}
                <div>
                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Quick facts</p>
                  <div className="space-y-2">
                    {[
                      ['Landlord', listing.landlord],
                      ['Phone', listing.phone],
                      ['Available', listing.available],
                      ['Lease type', '12-month lease'],
                      ['Utilities', 'Tenant pays'],
                      ['Pets', listing.amenities.includes('Pet friendly') ? 'Allowed' : 'Not allowed'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between bg-[#f9f8f6] rounded-xl px-3.5 py-2.5">
                        <span className="text-[12px] text-[#6c6a66]">{k}</span>
                        <span className="text-[12px] font-semibold text-[#1c1c1e]">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlights + landlord */}
                <div className="space-y-5">
                  <div>
                    <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Highlights</p>
                    <div className="grid grid-cols-2 gap-2">
                      {listing.amenities.slice(0, 4).map(a => (
                        <div key={a} className="bg-[#f9f8f6] rounded-2xl p-3 flex flex-col items-start gap-1.5">
                          <span className="text-xl">{amenityIcons[a] ?? '✅'}</span>
                          <span className="text-[11px] font-semibold text-[#1c1c1e] leading-snug">{a}</span>
                        </div>
                      ))}
                    </div>
                    {listing.amenities.length > 4 && (
                      <button onClick={() => switchTab('amenities')} className="mt-2 text-[12px] font-semibold text-[#1c1c1e] hover:underline">
                        +{listing.amenities.length - 4} more amenities →
                      </button>
                    )}
                  </div>

                  {/* Property manager */}
                  <div>
                    <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Property manager</p>
                    <div className="bg-[#f9f8f6] rounded-2xl p-3.5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1c1c1e] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {listing.landlord.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1c1c1e]">{listing.landlord}</p>
                        <p className="text-[11px] text-[#6c6a66] mt-0.5">{listing.phone}</p>
                      </div>
                      <button onClick={() => onNavigate?.('messages')} className="px-3 py-1.5 bg-[#1c1c1e] text-white text-[12px] font-semibold rounded-xl hover:bg-[#333] transition-colors flex-shrink-0">
                        Message →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews teaser */}
              {reviews.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest">Student reviews</p>
                    <button onClick={() => switchTab('reviews')} className="text-[12px] font-semibold text-[#1c1c1e] hover:underline">See all ({reviews.length}) →</button>
                  </div>
                  <div className="bg-[#f9f8f6] rounded-2xl p-4">
                    {reviews.slice(0, 1).map((r, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">{r.author[0]}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[12px] font-semibold text-[#1c1c1e]">{r.author}</span>
                            <span className="text-[11px] text-[#9ca3af]">{r.college} · {r.semester}</span>
                          </div>
                          <div className="flex gap-0.5 mb-1.5">
                            {Array.from({length: 5}).map((_, j) => (
                              <svg key={j} width="10" height="10" viewBox="0 0 24 24" fill={j < r.rating ? '#1c1c1e' : 'none'} stroke="#1c1c1e" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            ))}
                          </div>
                          <p className="text-[12px] text-[#3c3c3e] leading-relaxed">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Walk Times */}
          {activeTab === 'walk' && (
            <div>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-4">Walking distance from {listing.address}</p>
              <div className="grid grid-cols-2 gap-2.5">
                {colleges.map(c => {
                  const mins = listing.walkFrom[c.id]
                  const isHL = selectedCollegeId === c.id
                  const pct = Math.max(8, 100 - (mins - 4) * 8)
                  return (
                    <div key={c.id} className={`rounded-2xl px-4 py-4 ${isHL ? 'bg-[#1c1c1e]' : 'bg-[#f9f8f6]'}`}>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className={`text-[13px] font-semibold ${isHL ? 'text-white' : 'text-[#1c1c1e]'}`}>{c.short}</p>
                        <div className="flex items-center gap-2">
                          {mins <= 7 && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isHL ? 'bg-white/20 text-white' : 'bg-[#1c1c1e] text-white'}`}>Close</span>
                          )}
                          <span className={`text-[14px] font-bold ${isHL ? 'text-white' : 'text-[#1c1c1e]'}`}>{mins} min</span>
                        </div>
                      </div>
                      <div className={`h-1.5 rounded-full overflow-hidden ${isHL ? 'bg-white/20' : 'bg-black/10'}`}>
                        <div className={`h-full rounded-full ${isHL ? 'bg-white' : 'bg-[#1c1c1e]'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className={`text-[11px] mt-1.5 ${isHL ? 'text-white/50' : 'text-[#9ca3af]'}`}>{c.full}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Amenities */}
          {activeTab === 'amenities' && (
            <div>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-4">{listing.amenities.length} amenities included</p>
              <div className="grid grid-cols-3 gap-2">
                {listing.amenities.map(a => (
                  <div key={a} className="flex items-center gap-3 bg-[#f9f8f6] rounded-xl px-4 py-3">
                    <span className="text-lg">{amenityIcons[a] ?? '✅'}</span>
                    <span className="text-[13px] font-medium text-[#1c1c1e] flex-1">{a}</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {avgRating && (
                <div className="flex items-center gap-4 bg-[#f9f8f6] rounded-2xl p-4 mb-5">
                  <div className="text-center">
                    <p className="text-[40px] font-black text-[#1c1c1e] leading-none">{avgRating}</p>
                    <div className="flex gap-0.5 mt-1.5 justify-center">
                      {Array.from({length: 5}).map((_, j) => (
                        <svg key={j} width="11" height="11" viewBox="0 0 24 24" fill={j < Math.round(Number(avgRating)) ? '#1c1c1e' : 'none'} stroke="#1c1c1e" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#9ca3af] mt-1">{reviews.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3].map(star => {
                      const count = reviews.filter(r => r.rating === star).length
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[11px] text-[#9ca3af] w-3">{star}</span>
                          <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1c1c1e] rounded-full" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} />
                          </div>
                          <span className="text-[11px] text-[#9ca3af] w-3">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {reviews.map((r, i) => (
                <div key={i} className="bg-[#f9f8f6] rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1c1c1e] flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0">{r.author[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[13px] font-semibold text-[#1c1c1e]">{r.author}</span>
                        <span className="text-[11px] text-[#9ca3af]">{r.semester}</span>
                      </div>
                      <span className="text-[11px] font-medium text-[#6c6a66]">{r.college}</span>
                      <div className="flex gap-0.5 my-1.5">
                        {Array.from({length: 5}).map((_, j) => (
                          <svg key={j} width="10" height="10" viewBox="0 0 24 24" fill={j < r.rating ? '#1c1c1e' : 'none'} stroke="#1c1c1e" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ))}
                      </div>
                      <p className="text-[12px] text-[#3c3c3e] leading-relaxed">{r.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Community preview block */}
              {(() => {
                const ctx = neighborhoodCommunity[listing.neighborhood]
                if (!ctx) return null
                return (
                  <div className="rounded-2xl border border-[#e5e4e0] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-[#f9f8f6] border-b border-[#e5e4e0]">
                      <div className="flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <p className="text-[12px] font-bold text-[#1c1c1e]">What students say about this area</p>
                      </div>
                      <span className="text-[10px] font-semibold text-[#6c6a66] bg-[#e5e4e0] px-2 py-0.5 rounded-full">{ctx.posts.length} threads</span>
                    </div>
                    {/* Post previews */}
                    {ctx.posts.map((p, i) => (
                      <div key={i} className={`px-4 py-3 ${i < ctx.posts.length - 1 ? 'border-b border-[#f0efeb]' : ''}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f5f4f0] text-[#6c6a66]">{p.flair}</span>
                          <span className="text-[10px] text-[#9ca3af]">u/{p.author}</span>
                          <span className="text-[10px] text-[#9ca3af] ml-auto">▲ {p.votes}</span>
                        </div>
                        <p className="text-[12px] font-semibold text-[#1c1c1e] leading-snug mb-1">{p.title}</p>
                        <p className="text-[11px] text-[#6c6a66] leading-relaxed line-clamp-2">{p.preview}</p>
                      </div>
                    ))}
                    {/* CTA */}
                    <button
                      onClick={() => onNavigate?.('community', ctx.searchQuery)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[#1c1c1e] hover:bg-[#333] transition-colors"
                    >
                      <span className="text-[12px] font-semibold text-white">See all "{ctx.searchQuery}" discussions →</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                )
              })()}
            </div>
          )}

          {/* Apply wizard */}
          {activeTab === 'apply' && (
            <div className="max-w-lg">
              {applyStep !== 'done' && (
                <div className="flex items-center gap-3 mb-6">
                  {(['tour', 'info'] as const).map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${applyStep === s ? 'bg-[#1c1c1e] text-white' : applyStep === 'info' && s === 'tour' ? 'bg-[#1c1c1e] text-white' : 'bg-[#e5e4e0] text-[#9ca3af]'}`}>
                        {applyStep === 'info' && s === 'tour' ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : i + 1}
                      </div>
                      <span className={`text-[12px] font-semibold ${applyStep === s ? 'text-[#1c1c1e]' : 'text-[#9ca3af]'}`}>{s === 'tour' ? 'Schedule visit' : 'Your info'}</span>
                      {i < 1 && <div className="w-8 h-px bg-[#e5e4e0]" />}
                    </div>
                  ))}
                </div>
              )}

              {applyStep === 'tour' && (
                <>
                  <p className="text-[16px] font-bold text-[#1c1c1e] mb-0.5">Schedule a viewing</p>
                  <p className="text-[13px] text-[#6c6a66] mb-5">{listing.name} · {listing.address}</p>
                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-2">Pick a date</p>
                  <div className="grid grid-cols-7 gap-1.5 mb-5">
                    {tourDates.map(d => (
                      <button key={d.date} onClick={() => setTourDate(d.date)}
                        className={`flex flex-col items-center py-2.5 rounded-xl transition-colors ${tourDate === d.date ? 'bg-[#1c1c1e] text-white' : 'bg-[#f7f6f2] text-[#1c1c1e] hover:bg-[#e5e4e0]'}`}>
                        <span className="text-[10px] font-semibold opacity-60">{d.label}</span>
                        <span className="text-[12px] font-bold mt-0.5">{d.date.split(' ')[1]}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-2">Pick a time</p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {tourTimes.map(t => (
                      <button key={t} onClick={() => setTourTime(t)}
                        className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors ${tourTime === t ? 'bg-[#1c1c1e] text-white' : 'bg-[#f7f6f2] text-[#1c1c1e] hover:bg-[#e5e4e0]'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  {tourDate && tourTime && (
                    <div className="mb-4 bg-[#f9f8f6] border border-[#e5e4e0] rounded-xl px-4 py-3 flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <p className="text-[13px] font-semibold text-[#1c1c1e]">{tourDate}, {tourTime} · In-person viewing</p>
                    </div>
                  )}
                  <button onClick={() => { if (tourDate && tourTime) switchApplyStep('info') }}
                    className={`w-full rounded-2xl py-3 text-[14px] font-semibold transition-colors ${tourDate && tourTime ? 'bg-[#1c1c1e] text-white' : 'bg-[#e5e4e0] text-[#aaa] cursor-not-allowed'}`}>
                    Next: Your information →
                  </button>
                </>
              )}

              {applyStep === 'info' && (
                <>
                  <p className="text-[16px] font-bold text-[#1c1c1e] mb-0.5">Your information</p>
                  <p className="text-[13px] text-[#6c6a66] mb-5">Tour: {tourDate} at {tourTime}</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Full Name', val: applyName, set: setApplyName, ph: 'Jane Smith' },
                      { label: 'Email', val: applyEmail, set: setApplyEmail, ph: 'you@illinois.edu' },
                      { label: 'UIUC NetID', val: applyNetid, set: setApplyNetid, ph: 'jsmith4' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5 block">{f.label}</label>
                        <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                          className="w-full bg-[#f7f6f2] border border-transparent rounded-xl px-4 py-2.5 text-[13px] text-[#1c1c1e] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-[#1c1c1e]/10" />
                      </div>
                    ))}
                    <div>
                      <label className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5 block">Message to landlord</label>
                      <textarea value={applyNote} onChange={e => setApplyNote(e.target.value)} rows={3} placeholder={`Hi, I'm interested in ${listing.name}...`}
                        className="w-full bg-[#f7f6f2] rounded-xl px-4 py-2.5 text-[13px] text-[#1c1c1e] placeholder-[#bbb] outline-none focus:ring-2 focus:ring-[#1c1c1e]/10 resize-none" />
                    </div>
                  </div>
                  <div className="flex gap-2.5 mt-4">
                    <button onClick={() => switchApplyStep('tour')} className="py-3 px-5 bg-[#f7f6f2] rounded-2xl text-[#1c1c1e] text-[13px] font-semibold hover:bg-[#e5e4e0] transition-colors">← Back</button>
                    <button onClick={() => { if (applyName && applyEmail) switchApplyStep('done') }}
                      className={`flex-1 rounded-2xl py-3 text-[14px] font-semibold transition-colors ${applyName && applyEmail ? 'bg-[#1c1c1e] text-white' : 'bg-[#e5e4e0] text-[#aaa] cursor-not-allowed'}`}>
                      Submit &amp; Confirm Tour
                    </button>
                  </div>
                </>
              )}

              {applyStep === 'done' && (
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-[#f9f8f6] border-2 border-[#1c1c1e] flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[20px] font-bold text-[#1c1c1e] mb-1">You're confirmed!</p>
                  <p className="text-[13px] text-[#6c6a66] mb-5">{tourDate} · {tourTime} at {listing.name}</p>
                  <div className="w-full bg-[#f9f8f6] rounded-2xl divide-y divide-[#f0efeb] mb-5 text-left">
                    {[
                      ['Tour scheduled', `${tourDate} at ${tourTime}`],
                      ['Application sent', `Sent to ${listing.landlord}`],
                      ['Message thread opened', 'Chat directly with the landlord'],
                    ].map(([title, sub]) => (
                      <div key={title} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#1c1c1e]">{title}</p>
                          <p className="text-[11px] text-[#9ca3af]">{sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { onNavigate?.('messages') }} className="w-full bg-[#1c1c1e] text-white rounded-2xl py-3 text-[14px] font-semibold mb-2 hover:bg-[#333] transition-colors">Open Messages →</button>
                  <button onClick={onBack} className="text-[13px] text-[#9ca3af] hover:text-[#1c1c1e] transition-colors">Back to listings</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
