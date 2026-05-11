import { useState, useEffect, useRef } from 'react'

const flairs = [
  { id: 'advice',   label: 'Advice' },
  { id: 'building', label: 'Building Talk' },
  { id: 'area',     label: 'Area Insight' },
  { id: 'scam',     label: 'Scam Alert' },
  { id: 'reviews',  label: 'Reviews' },
  { id: 'sublease', label: 'Sublease' },
]

const posts = [
  {
    id: 1, flair: 'advice', author: 'Emma_W', avatar: 'EW', time: '2h ago',
    title: 'Best streets for Grainger students? First St vs. Green St vs. Chalmers',
    body: "I'm an incoming freshman in CS and trying to figure out where to live. Engineering quad is my main building. First St seems close but is it worth the price premium? Green St seems fun but noisy. Chalmers feels off the beaten path. Would love to hear from people who've lived in each area.",
    votes: 124, comments: 14, saved: false,
  },
  {
    id: 2, flair: 'scam', author: 'Marcus_T', avatar: 'MT', time: '5h ago',
    title: '⚠️ Watch out for fake listings on Craigslist — got scammed $500',
    body: "I sent a deposit for a place on 4th St before visiting in person. Turns out it didn't exist. The landlord had stolen photos from a real listing. Always verify in person or through a verified platform. Reporting to UIPD now.",
    votes: 341, comments: 31, saved: false,
  },
  {
    id: 3, flair: 'building', author: 'Priya_K', avatar: 'PK', time: '1d ago',
    title: 'HERE Champaign noise levels on weekends — honest review after 1 year',
    body: "It's loud Friday and Saturday nights, especially floors 3–7. The soundproofing is mediocre. That said, the amenities (pool, study pods) are legitimately good. If you're a light sleeper or study on weekends, ask for a high floor or avoid it.",
    votes: 88, comments: 22, saved: false,
  },
  {
    id: 4, flair: 'area', author: 'Jordan_L', avatar: 'JL', time: '2d ago',
    title: 'South Champaign vs. Green Street — honest pros/cons after living in both',
    body: "Lived on Green St junior year and South Campus senior year. Green St: walkable, social, expensive, noisy. South Campus: cheaper, quieter, need a bike. For grad students South is better. Undergrads who want the college experience — Green St is worth it.",
    votes: 67, comments: 19, saved: false,
  },
  {
    id: 5, flair: 'sublease', author: 'Yuna_C', avatar: 'YC', time: '3d ago',
    title: 'Looking for 1BR sublease May–Aug 2026, budget $750/mo',
    body: "Study abroad in fall, need somewhere to come back to for summer. I'm clean, quiet, grad student in LAS. Flexible on location but prefer to be within 15 min walk of the Main Quad. DM if you have anything!",
    votes: 12, comments: 6, saved: false,
  },
  {
    id: 6, flair: 'reviews', author: 'Alex_R', avatar: 'AR', time: '4d ago',
    title: 'Green Street Properties landlord review — 4/5 stars',
    body: "Lived at The Dean Apartments for 2 years. Maintenance is fast, usually same day. Lease renewal process is painless. One downside: they were slow to return the security deposit (took 28 days). Overall one of the better landlords near campus.",
    votes: 45, comments: 9, saved: false,
  },
  {
    id: 7, flair: 'advice', author: 'Shawn_P', avatar: 'SP', time: '5d ago',
    title: 'How early should I start looking for fall 2026 apartments?',
    body: "I keep hearing that Champaign apartments go fast. Is it really necessary to sign a lease in October for August move-in? Seems crazy. Are there still decent options in January/February?",
    votes: 93, comments: 27, saved: false,
  },
]

const sortOptions = ['Hot', 'New', 'Top', 'Rising'] as const
type SortOption = typeof sortOptions[number]

const flairColors: Record<string, string> = {
  advice: 'bg-[#f5f4f0] text-[#1c1c1e]',
  building: 'bg-[#f5f4f0] text-[#1c1c1e]',
  area: 'bg-[#f5f4f0] text-[#1c1c1e]',
  scam: 'bg-[#1c1c1e] text-white',
  reviews: 'bg-[#f5f4f0] text-[#1c1c1e]',
  sublease: 'bg-[#f5f4f0] text-[#1c1c1e]',
}

const sampleComments: Record<number, { author: string; text: string; time: string; votes: number }[]> = {
  1: [
    { author: 'Jake_H', text: 'First St is close but pricey. Green St is worth it for the energy freshman year.', time: '1h ago', votes: 18 },
    { author: 'Mia_L', text: 'Chalmers is underrated imo — quiet and cheap, and the 22 bus is right there.', time: '45m ago', votes: 12 },
    { author: 'Tyler_B', text: 'Lived on First St junior year. No regrets, the walkability to Grainger is unreal.', time: '20m ago', votes: 7 },
  ],
  2: [
    { author: 'Emma_W', text: 'THIS. Always visit in person before sending any money. So sorry this happened.', time: '4h ago', votes: 45 },
    { author: 'Sam_P', text: 'CampusNest verified listings are the way to go — all docs are checked before listing.', time: '3h ago', votes: 31 },
  ],
  3: [
    { author: 'Omar_F', text: 'Can confirm — floors 4–6 are the loudest. Floor 9+ is fine though.', time: '20h ago', votes: 22 },
    { author: 'Nina_C', text: 'The study pods are genuinely great. Never had a problem finding one.', time: '18h ago', votes: 14 },
  ],
  4: [
    { author: 'Alex_R', text: 'South Campus is so underrated. Got a 2BR for $900/mo last year.', time: '1d ago', votes: 9 },
    { author: 'Priya_K', text: 'Green St is great for undergrads but I would never go back as a grad student.', time: '22h ago', votes: 6 },
  ],
  5: [
    { author: 'Jake_H', text: 'I have a place on 4th St available June–Aug, DM me!', time: '2d ago', votes: 3 },
  ],
  6: [
    { author: 'Shawn_P', text: 'Had the same experience. Solid landlord overall.', time: '3d ago', votes: 8 },
  ],
  7: [
    { author: 'Emma_W', text: 'Yes, October is not too early for popular buildings. Good options exist through January though.', time: '4d ago', votes: 15 },
    { author: 'Marcus_T', text: 'Signed in November for a great place. Don\'t panic but don\'t wait until March.', time: '4d ago', votes: 11 },
  ],
}

const defaultComment = [{ author: 'student_anon', text: 'Great post, thanks for sharing!', time: '1h ago', votes: 2 }]

interface CommunityProps {
  initialSearch?: string
  onSearchConsumed?: () => void
}

export default function WebCommunityScreen({ initialSearch = '', onSearchConsumed }: CommunityProps) {
  const [sort, setSort] = useState<SortOption>('Hot')
  const [activeFlair, setActiveFlair] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<number, number>>(Object.fromEntries(posts.map(p => [p.id, p.votes])))
  const [voted, setVoted] = useState<Record<number, 'up' | 'down' | null>>(Object.fromEntries(posts.map(p => [p.id, null])))
  const [saved, setSaved] = useState<Set<number>>(new Set())
  const [showCompose, setShowCompose] = useState(false)
  const [composeTitle, setComposeTitle] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeFlair, setComposeFlair] = useState('advice')
  const [toast, setToast] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [postSuccess, setPostSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null)
  const replyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialSearch) { setSearchQuery(initialSearch); onSearchConsumed?.() }
  }, [initialSearch])

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500) }

  const openPost = (id: number) => {
    setSelectedPostId(id)
    window.location.hash = `community/post/${id}`
  }

  const openPostComments = (id: number) => {
    setSelectedPostId(id)
    window.location.hash = `community/post/${id}/comments`
  }

  const closePost = () => {
    setSelectedPostId(null)
    window.location.hash = 'community'
  }

  const handleShare = (id: number) => {
    navigator.clipboard.writeText(`https://campusnest.app/community/post/${id}`).catch(() => {})
    showToast('Link copied to clipboard!')
  }

  const handlePost = () => {
    if (!composeTitle.trim()) return
    setPostSuccess(true)
    setTimeout(() => { setShowCompose(false); setPostSuccess(false); setComposeTitle(''); setComposeBody('') }, 1800)
    showToast('Post published to r/CampusNest!')
  }

  const vote = (id: number, dir: 'up' | 'down') => {
    setVoted(prev => {
      const cur = prev[id]
      const next = cur === dir ? null : dir
      setVotes(v => ({
        ...v,
        [id]: posts.find(p => p.id === id)!.votes
          + (next === 'up' ? 1 : next === 'down' ? -1 : 0)
          - (cur === 'up' ? 1 : cur === 'down' ? -1 : 0),
      }))
      return { ...prev, [id]: next }
    })
  }

  const toggleSave = (id: number, fromDetail = false) => {
    const willSave = !saved.has(id)
    setSaved(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    if (fromDetail) {
      showToast(willSave ? 'Post saved!' : 'Removed from saved')
    }
  }

  const q = searchQuery.trim().toLowerCase()
  const filtered = posts.filter(p =>
    (!activeFlair || p.flair === activeFlair) &&
    (!q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
  )
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'Top') return votes[b.id] - votes[a.id]
    if (sort === 'New') return a.id > b.id ? -1 : 1
    return 0
  })

  // ── Post detail view ──────────────────────────────────────────────────────
  const detailPost = selectedPostId != null ? posts.find(p => p.id === selectedPostId) : null
  if (detailPost) {
    const flair = flairs.find(f => f.id === detailPost.flair)!
    const v = voted[detailPost.id]
    const postComments = sampleComments[detailPost.id] ?? defaultComment

    return (
      <div className="flex-1 overflow-y-auto bg-[#f5f4f0]">
        {/* Detail Header */}
        <div className="bg-white border-b border-[#e5e4e0] sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-8 py-4 flex items-center gap-3">
            <button
              onClick={closePost}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Community
            </button>
            <span className="text-[#e5e4e0]">/</span>
            <span className="text-[13px] font-semibold text-[#1c1c1e] truncate max-w-sm">{detailPost.title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex gap-6">
            {/* Main post content */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Post card */}
              <div className="bg-white rounded-2xl border border-[#e5e4e0] overflow-hidden flex">
                {/* Vote column */}
                <div className="flex flex-col items-center gap-1 px-3 py-5 bg-[#f9f8f6] flex-shrink-0 w-12">
                  <button
                    onClick={() => vote(detailPost.id, 'up')}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${v === 'up' ? 'text-[#1c1c1e] bg-[#e5e4e0]' : 'text-[#9ca3af] hover:text-[#1c1c1e] hover:bg-[#ede]'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={v === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15"/>
                    </svg>
                  </button>
                  <span className={`text-[13px] font-bold leading-none ${v === 'up' ? 'text-[#1c1c1e]' : 'text-[#6c6a66]'}`}>
                    {votes[detailPost.id] >= 1000 ? `${(votes[detailPost.id]/1000).toFixed(1)}k` : votes[detailPost.id]}
                  </span>
                  <button
                    onClick={() => vote(detailPost.id, 'down')}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${v === 'down' ? 'text-[#6c6a66] bg-[#e5e4e0]' : 'text-[#9ca3af] hover:text-[#6c6a66] hover:bg-[#ede]'}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={v === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-5">
                  {/* Meta */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flairColors[detailPost.flair]}`}>
                      {flair.label}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#f5f4f0] flex items-center justify-center text-[9px] font-bold text-[#6c6a66]">
                      {detailPost.avatar}
                    </div>
                    <span className="text-[12px] text-[#9ca3af]">
                      Posted by <span className="font-semibold text-[#6c6a66]">u/{detailPost.author}</span>
                    </span>
                    <span className="text-[12px] text-[#9ca3af]">{detailPost.time}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-[18px] font-bold text-[#1c1c1e] leading-snug mb-3">{detailPost.title}</h2>

                  {/* Full body */}
                  <p className="text-[14px] text-[#3c3c3e] leading-relaxed mb-4">{detailPost.body}</p>

                  {/* Action bar */}
                  <div className="flex items-center gap-1 pt-3 border-t border-[#f5f4f0]">
                    <button
                      onClick={() => {
                        window.location.hash = `community/post/${detailPost.id}/comments`
                        setTimeout(() => replyInputRef.current?.focus(), 50)
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {detailPost.comments} Comments
                    </button>
                    <button
                      onClick={() => handleShare(detailPost.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                      </svg>
                      Share
                    </button>
                    <button
                      onClick={() => toggleSave(detailPost.id, true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-colors ${saved.has(detailPost.id) ? 'bg-[#f5f4f0] text-[#1c1c1e]' : 'text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e]'}`}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill={saved.has(detailPost.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                      </svg>
                      {saved.has(detailPost.id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Comments section */}
              <div className="bg-white rounded-2xl border border-[#e5e4e0] p-5">
                <h3 className="text-[14px] font-bold text-[#1c1c1e] mb-4">{detailPost.comments} Comments</h3>

                {/* Reply input */}
                <div className="flex gap-3 mb-5 pb-5 border-b border-[#f5f4f0]">
                  <div className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">L</div>
                  <div className="flex-1">
                    <input
                      ref={replyInputRef}
                      placeholder="Add a comment…"
                      onFocus={() => { window.location.hash = `community/post/${detailPost.id}/reply` }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                          (e.target as HTMLInputElement).value = ''
                          window.location.hash = `community/post/${detailPost.id}`
                          showToast('Comment posted!')
                        }
                      }}
                      className="w-full text-[13px] px-4 py-2.5 rounded-xl border border-[#e5e4e0] placeholder-[#9ca3af] outline-none focus:border-[#1c1c1e] text-[#1c1c1e] transition-colors"
                    />
                  </div>
                </div>

                {/* Comment list */}
                <div className="space-y-5">
                  {postComments.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#f5f4f0] flex items-center justify-center text-[11px] font-bold text-[#6c6a66] flex-shrink-0">{c.author[0].toUpperCase()}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-[#1c1c1e]">u/{c.author}</span>
                          <span className="text-[11px] text-[#9ca3af]">{c.time}</span>
                        </div>
                        <p className="text-[13px] text-[#3c3c3e] leading-relaxed mb-2">{c.text}</p>
                        <div className="flex items-center gap-1">
                          <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[#9ca3af] hover:text-[#1c1c1e] hover:bg-[#f5f4f0] transition-colors font-semibold">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                            {c.votes}
                          </button>
                          <button
                            onClick={() => {
                              window.location.hash = `community/post/${detailPost.id}/reply`
                              replyInputRef.current?.focus()
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] text-[#9ca3af] hover:text-[#1c1c1e] hover:bg-[#f5f4f0] transition-colors font-semibold"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar — same as list view */}
            <div className="w-72 flex-shrink-0 space-y-4">
              <div className="bg-white rounded-2xl border border-[#e5e4e0] overflow-hidden">
                <div className="bg-[#1c1c1e] h-16 relative">
                  <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-white border-2 border-white flex items-center justify-center text-2xl shadow-sm">🏠</div>
                </div>
                <div className="px-4 pt-8 pb-4">
                  <p className="text-[14px] font-bold text-[#1c1c1e]">r/CampusNest</p>
                  <p className="text-[12px] text-[#6c6a66] mt-1 leading-relaxed">The UIUC student housing community. Find apartments, share reviews, avoid scams, and connect with fellow students.</p>
                  <div className="flex gap-4 mt-3 py-3 border-y border-[#f0efeb]">
                    <div className="text-center">
                      <p className="text-[15px] font-black text-[#1c1c1e]">1.2k</p>
                      <p className="text-[10px] text-[#9ca3af] font-medium">Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-black text-[#1c1c1e]">48</p>
                      <p className="text-[10px] text-[#9ca3af] font-medium">Posts/week</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-[#1c1c1e] animate-pulse" />
                        <p className="text-[15px] font-black text-[#1c1c1e]">34</p>
                      </div>
                      <p className="text-[10px] text-[#9ca3af] font-medium">Online now</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCompose(true)}
                    className="w-full mt-3 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors"
                  >
                    + Create Post
                  </button>
                </div>
              </div>

              {/* Flair sidebar */}
              <div className="bg-white rounded-2xl border border-[#e5e4e0] p-4">
                <p className="text-[12px] font-bold text-[#1c1c1e] uppercase tracking-wider mb-3">Browse by Flair</p>
                <div className="space-y-1">
                  {flairs.map(f => (
                    <button
                      key={f.id}
                      onClick={() => { closePost(); setActiveFlair(f.id) }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium transition-colors hover:bg-[#f5f4f0] text-[#1c1c1e]"
                    >
                      <span>{f.label}</span>
                      <span className="text-[10px] font-bold text-[#9ca3af]">{posts.filter(p => p.flair === f.id).length}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compose modal */}
        {showCompose && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowCompose(false)}>
            <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0efeb]">
                <h3 className="text-[15px] font-bold text-[#1c1c1e]">Create a post</h3>
                <button onClick={() => setShowCompose(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Flair</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {flairs.map(f => (
                      <button key={f.id} onClick={() => setComposeFlair(f.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${composeFlair === f.id ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e5e4e0] text-[#6c6a66] hover:border-[#1c1c1e]'}`}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
                <input value={composeTitle} onChange={e => setComposeTitle(e.target.value)} placeholder="An interesting title..." className="w-full px-4 py-3 rounded-xl border border-[#e5e4e0] text-[14px] font-semibold text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#1c1c1e] transition-colors" />
                <textarea value={composeBody} onChange={e => setComposeBody(e.target.value)} placeholder="What's on your mind?" rows={5} className="w-full px-4 py-3 rounded-xl border border-[#e5e4e0] text-[13px] text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#1c1c1e] transition-colors resize-none leading-relaxed" />
                {postSuccess ? (
                  <div className="py-6 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-[#f5f4f0] flex items-center justify-center mx-auto">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-[15px] font-bold text-[#1c1c1e]">Post published!</p>
                    <p className="text-[13px] text-[#6c6a66]">Your post is now live in r/CampusNest.</p>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowCompose(false)} className="flex-1 py-2.5 rounded-xl border border-[#e5e4e0] text-[13px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] transition-colors">Cancel</button>
                    <button onClick={handlePost} disabled={!composeTitle.trim()} className="flex-1 py-2.5 bg-[#1c1c1e] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Post</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1c1c1e] text-white text-[13px] font-semibold px-5 py-3 rounded-2xl shadow-xl pointer-events-none" style={{ animation: 'fadeIn 0.2s ease' }}>
            {toast}
          </div>
        )}
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-y-auto bg-[#f5f4f0]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e4e0]">
        <div className="max-w-5xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1c1c1e] tracking-tight">Community</h1>
              <p className="text-sm text-[#6c6a66] mt-0.5">1,240 members · UIUC housing community</p>
            </div>
            <button
              onClick={() => setShowCompose(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Create Post
            </button>
          </div>
          {/* Search bar */}
          <div className="relative mt-4">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search posts…"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e5e4e0] text-[13px] text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#1c1c1e] transition-colors bg-[#f9f8f6]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#1c1c1e] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          {/* Sort + flair filters */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {sortOptions.map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${sort === s ? 'bg-[#1c1c1e] text-white' : 'bg-[#f5f4f0] text-[#6c6a66] hover:bg-[#e5e4e0] hover:text-[#1c1c1e]'}`}
              >
                {s}
              </button>
            ))}
            <div className="w-px h-5 bg-[#e5e4e0] mx-1" />
            {flairs.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFlair(activeFlair === f.id ? null : f.id)}
                className={`px-4 py-1.5 rounded-xl text-[13px] font-semibold transition-all ${activeFlair === f.id ? 'bg-[#1c1c1e] text-white' : 'bg-[#f5f4f0] text-[#6c6a66] hover:bg-[#e5e4e0] hover:text-[#1c1c1e]'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-5">
        <div className="flex gap-6">

          {/* Main feed */}
          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {sorted.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#e5e4e0] px-8 py-12 text-center">
                  <p className="text-[15px] font-bold text-[#1c1c1e] mb-1">No posts found</p>
                  <p className="text-[13px] text-[#9ca3af]">Try a different keyword or clear the search</p>
                </div>
              )}
              {sorted.map(post => {
                const flair = flairs.find(f => f.id === post.flair)!
                const v = voted[post.id]
                return (
                  <div key={post.id} className="bg-white rounded-2xl border border-[#e5e4e0] hover:border-[#c0bfbb] transition-all overflow-hidden flex group">

                    {/* Vote column */}
                    <div className="flex flex-col items-center gap-1 px-3 py-4 bg-[#f9f8f6] flex-shrink-0 w-12">
                      <button
                        onClick={() => vote(post.id, 'up')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${v === 'up' ? 'text-[#1c1c1e] bg-[#e5e4e0]' : 'text-[#9ca3af] hover:text-[#1c1c1e] hover:bg-[#ede]'}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={v === 'up' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15"/>
                        </svg>
                      </button>
                      <span className={`text-[12px] font-bold leading-none ${v === 'up' ? 'text-[#1c1c1e]' : v === 'down' ? 'text-[#6c6a66]' : 'text-[#6c6a66]'}`}>
                        {votes[post.id] >= 1000 ? `${(votes[post.id]/1000).toFixed(1)}k` : votes[post.id]}
                      </span>
                      <button
                        onClick={() => vote(post.id, 'down')}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${v === 'down' ? 'text-[#6c6a66] bg-[#e5e4e0]' : 'text-[#9ca3af] hover:text-[#6c6a66] hover:bg-[#ede]'}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill={v === 'down' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    </div>

                    {/* Content — clickable to open detail */}
                    <div className="flex-1 min-w-0 p-4 cursor-pointer" onClick={() => openPost(post.id)}>
                      {/* Meta */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flairColors[post.flair]}`}>
                          {flair.label}
                        </span>
                        <span className="text-[11px] text-[#9ca3af]">
                          Posted by <span className="font-semibold text-[#6c6a66]">u/{post.author}</span>
                        </span>
                        <span className="text-[11px] text-[#9ca3af]">{post.time}</span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[14px] font-bold text-[#1c1c1e] leading-snug mb-1.5 group-hover:underline">{post.title}</h3>

                      {/* Body preview */}
                      <p className="text-[12px] text-[#6c6a66] leading-relaxed line-clamp-2 mb-3">{post.body}</p>

                      {/* Action bar */}
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openPostComments(post.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e]"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          {post.comments} Comments
                        </button>
                        <button onClick={() => handleShare(post.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
                          </svg>
                          Share
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(post.id, true) }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${saved.has(post.id) ? 'bg-[#f5f4f0] text-[#1c1c1e]' : 'text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e]'}`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill={saved.has(post.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                          </svg>
                          {saved.has(post.id) ? 'Saved' : 'Save'}
                        </button>
                        <div className="relative ml-auto">
                          <button onClick={() => setMenuOpen(menuOpen === post.id ? null : post.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                            </svg>
                          </button>
                          {menuOpen === post.id && (
                            <div className="absolute right-0 bottom-8 bg-white rounded-xl border border-[#e5e4e0] shadow-lg py-1 w-36 z-10">
                              {['Hide post', 'Report', 'Block user'].map(item => (
                                <button key={item} onClick={() => { setMenuOpen(null); showToast(item === 'Hide post' ? 'Post hidden' : item === 'Report' ? 'Post reported' : 'User blocked') }} className="w-full text-left px-3 py-2 text-[12px] text-[#1c1c1e] hover:bg-[#f5f4f0] transition-colors">
                                  {item}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-72 flex-shrink-0 space-y-4">
            <div className="bg-white rounded-2xl border border-[#e5e4e0] overflow-hidden">
              <div className="bg-[#1c1c1e] h-16 relative">
                <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-xl bg-white border-2 border-white flex items-center justify-center text-2xl shadow-sm">🏠</div>
              </div>
              <div className="px-4 pt-8 pb-4">
                <p className="text-[14px] font-bold text-[#1c1c1e]">r/CampusNest</p>
                <p className="text-[12px] text-[#6c6a66] mt-1 leading-relaxed">The UIUC student housing community. Find apartments, share reviews, avoid scams, and connect with fellow students.</p>
                <div className="flex gap-4 mt-3 py-3 border-y border-[#f0efeb]">
                  <div className="text-center">
                    <p className="text-[15px] font-black text-[#1c1c1e]">1.2k</p>
                    <p className="text-[10px] text-[#9ca3af] font-medium">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[15px] font-black text-[#1c1c1e]">48</p>
                    <p className="text-[10px] text-[#9ca3af] font-medium">Posts/week</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#1c1c1e] animate-pulse" />
                      <p className="text-[15px] font-black text-[#1c1c1e]">34</p>
                    </div>
                    <p className="text-[10px] text-[#9ca3af] font-medium">Online now</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompose(true)}
                  className="w-full mt-3 py-2.5 bg-[#1c1c1e] text-white text-[13px] font-semibold rounded-xl hover:bg-[#333] transition-colors"
                >
                  + Create Post
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e4e0] p-4">
              <p className="text-[12px] font-bold text-[#1c1c1e] uppercase tracking-wider mb-3">Browse by Flair</p>
              <div className="space-y-1">
                {flairs.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFlair(activeFlair === f.id ? null : f.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium transition-colors ${activeFlair === f.id ? 'bg-[#1c1c1e] text-white' : 'hover:bg-[#f5f4f0] text-[#1c1c1e]'}`}
                  >
                    <span className="flex items-center gap-2">{f.label}</span>
                    <span className={`text-[10px] font-bold ${activeFlair === f.id ? 'text-white/60' : 'text-[#9ca3af]'}`}>
                      {posts.filter(p => p.flair === f.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#e5e4e0] p-4">
              <p className="text-[12px] font-bold text-[#1c1c1e] uppercase tracking-wider mb-3">Community Rules</p>
              <div className="space-y-2">
                {[
                  'Be respectful to all members',
                  'No fake listings or spam',
                  'Use appropriate flairs',
                  'Verify before sharing scam alerts',
                  'No personal attacks on landlords',
                ].map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[11px] font-bold text-[#9ca3af] mt-0.5 flex-shrink-0">{i + 1}.</span>
                    <p className="text-[12px] text-[#6c6a66] leading-snug">{rule}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowCompose(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0efeb]">
              <h3 className="text-[15px] font-bold text-[#1c1c1e]">Create a post</h3>
              <button onClick={() => setShowCompose(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:bg-[#f5f4f0] hover:text-[#1c1c1e] transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Flair</p>
                <div className="flex gap-1.5 flex-wrap">
                  {flairs.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setComposeFlair(f.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${composeFlair === f.id ? 'bg-[#1c1c1e] text-white border-[#1c1c1e]' : 'border-[#e5e4e0] text-[#6c6a66] hover:border-[#1c1c1e]'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <input
                  value={composeTitle}
                  onChange={e => setComposeTitle(e.target.value)}
                  placeholder="An interesting title..."
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e4e0] text-[14px] font-semibold text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#1c1c1e] transition-colors"
                />
              </div>
              <div>
                <textarea
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  placeholder="What's on your mind? Share tips, ask questions, or warn the community..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-[#e5e4e0] text-[13px] text-[#1c1c1e] placeholder-[#9ca3af] outline-none focus:border-[#1c1c1e] transition-colors resize-none leading-relaxed"
                />
              </div>
              {postSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#f5f4f0] flex items-center justify-center mx-auto">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1c1c1e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-[15px] font-bold text-[#1c1c1e]">Post published!</p>
                  <p className="text-[13px] text-[#6c6a66]">Your post is now live in r/CampusNest.</p>
                </div>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setShowCompose(false)} className="flex-1 py-2.5 rounded-xl border border-[#e5e4e0] text-[13px] font-semibold text-[#6c6a66] hover:bg-[#f5f4f0] transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={!composeTitle.trim()}
                    className="flex-1 py-2.5 bg-[#1c1c1e] text-white rounded-xl text-[13px] font-semibold hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#1c1c1e] text-white text-[13px] font-semibold px-5 py-3 rounded-2xl shadow-xl pointer-events-none" style={{ animation: 'fadeIn 0.2s ease' }}>
          {toast}
        </div>
      )}
    </div>
  )
}
