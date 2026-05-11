import { useState, useRef, useEffect } from 'react'

interface Message {
  id: number
  from: 'me' | 'landlord'
  text: string
  time: string
  read: boolean
}

interface Thread {
  id: number
  landlord: string
  listing: string
  address: string
  avatar: string
  lastMsg: string
  lastTime: string
  unread: number
  status: 'Tour scheduled' | 'Application pending' | 'Lease signed' | 'Inquiry'
  messages: Message[]
}

const threads: Thread[] = [
  {
    id: 1,
    landlord: 'UIUC Housing Co.',
    listing: 'Green Street Lofts',
    address: '302 E Green St',
    avatar: 'UH',
    lastMsg: 'Great! We\'ll see you then. Please bring a valid ID.',
    lastTime: '2h ago',
    unread: 1,
    status: 'Tour scheduled',
    messages: [
      { id: 1, from: 'me', text: 'Hi, I\'m interested in the studio at Green Street Lofts starting Aug 2026. I scheduled a tour for Apr 7 at 10:00 AM. Is that confirmed?', time: 'Apr 3 · 9:14 AM', read: true },
      { id: 2, from: 'landlord', text: 'Hi! Yes, your tour is confirmed for Monday Apr 7 at 10:00 AM. The unit is on the 2nd floor, just ask for Mark at the front desk.', time: 'Apr 3 · 11:02 AM', read: true },
      { id: 3, from: 'me', text: 'Perfect, thank you! Is street parking available nearby?', time: 'Apr 3 · 11:15 AM', read: true },
      { id: 4, from: 'landlord', text: 'Great! We\'ll see you then. Please bring a valid ID.', time: 'Apr 3 · 2:30 PM', read: false },
    ],
  },
  {
    id: 2,
    landlord: 'Campus Properties LLC',
    listing: 'Illini Tower',
    address: '1005 S Wright St',
    avatar: 'CP',
    lastMsg: 'The unit is still available. Would you like to schedule a viewing?',
    lastTime: '1d ago',
    unread: 0,
    status: 'Inquiry',
    messages: [
      { id: 1, from: 'me', text: 'Hello, I saw your listing for a 1BR at Illini Tower. Is it still available for Fall 2026?', time: 'Apr 2 · 3:45 PM', read: true },
      { id: 2, from: 'landlord', text: 'The unit is still available. Would you like to schedule a viewing?', time: 'Apr 2 · 5:10 PM', read: true },
    ],
  },
  {
    id: 3,
    landlord: 'Green & Wright Properties',
    listing: 'HERE Champaign',
    address: '512 S Mattis Ave',
    avatar: 'GW',
    lastMsg: 'Your application is under review. We\'ll follow up by end of week.',
    lastTime: '3d ago',
    unread: 0,
    status: 'Application pending',
    messages: [
      { id: 1, from: 'me', text: 'Hi, I submitted an application for the 2BR at HERE Champaign. Can you confirm you received it?', time: 'Mar 31 · 10:00 AM', read: true },
      { id: 2, from: 'landlord', text: 'Yes, we received your application. We\'re reviewing a few candidates.', time: 'Mar 31 · 2:14 PM', read: true },
      { id: 3, from: 'me', text: 'Is there anything else you need from me?', time: 'Apr 1 · 9:30 AM', read: true },
      { id: 4, from: 'landlord', text: 'Your application is under review. We\'ll follow up by end of week.', time: 'Apr 1 · 11:45 AM', read: true },
    ],
  },
]

const statusColors: Record<string, string> = {
  'Tour scheduled': 'bg-blue-100 text-blue-700',
  'Application pending': 'bg-amber-100 text-amber-700',
  'Lease signed': 'bg-emerald-100 text-emerald-700',
  'Inquiry': 'bg-[#f0efeb] text-[#6c6a66]',
}

function downloadICS(thread: typeof threads[0]) {
  // Tour: Mon Apr 7 2026, 10:00 AM (hardcoded for demo)
  const dtStart = '20260407T100000'
  const dtEnd   = '20260407T110000'
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CampusNest//EN',
    'BEGIN:VEVENT',
    `UID:tour-${thread.id}@campusnest`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:Tour – ${thread.listing}`,
    `DESCRIPTION:In-person tour at ${thread.address}. Arranged via CampusNest.`,
    `LOCATION:${thread.address}, Champaign, IL`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `campusnest-tour-${thread.listing.replace(/\s+/g, '-').toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(url)
}

export default function WebMessagesScreen() {
  const [activeThread, setActiveThread] = useState(threads[0])
  const [calDropdown, setCalDropdown] = useState(false)
  const [input, setInput] = useState('')
  const [localMessages, setLocalMessages] = useState<Record<number, Message[]>>(
    Object.fromEntries(threads.map(t => [t.id, t.messages]))
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread.id, localMessages])

  const send = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now(),
      from: 'me',
      text: input.trim(),
      time: 'Just now',
      read: true,
    }
    setLocalMessages(prev => ({
      ...prev,
      [activeThread.id]: [...(prev[activeThread.id] ?? []), newMsg],
    }))
    setInput('')

    // Simulate landlord reply after 1.5s
    setTimeout(() => {
      const replies = [
        'Thanks for your message! We\'ll get back to you shortly.',
        'Got it, I\'ll check and follow up.',
        'Sure! Let me confirm that with our team.',
        'That works for us. Looking forward to meeting you!',
      ]
      const reply: Message = {
        id: Date.now() + 1,
        from: 'landlord',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: 'Just now',
        read: false,
      }
      setLocalMessages(prev => ({
        ...prev,
        [activeThread.id]: [...(prev[activeThread.id] ?? []), reply],
      }))
    }, 1500)
  }

  const msgs = localMessages[activeThread.id] ?? []

  return (
    <div className="flex-1 flex overflow-hidden bg-[#ecebe7]">
      {/* Thread list */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-[#e5e4e0] flex flex-col">
        <div className="px-5 py-4 border-b border-[#f0efeb]">
          <h2 className="text-[16px] font-bold text-[#1c1c1e]">Messages</h2>
          <p className="text-[12px] text-[#6c6a66] mt-0.5">Chat with landlords</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {threads.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t)}
              className={`w-full text-left px-4 py-3.5 border-b border-[#f5f4f0] transition-colors ${
                activeThread.id === t.id ? 'bg-[#f7f6f2]' : 'hover:bg-[#fafaf8]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[13px] font-semibold text-[#1c1c1e] truncate">{t.listing}</p>
                    <span className="text-[11px] text-[#aaa] flex-shrink-0">{t.lastTime}</span>
                  </div>
                  <p className="text-[11px] text-[#6c6a66] truncate mt-0.5">{t.landlord}</p>
                  <p className="text-[12px] text-[#6c6a66] truncate mt-1 leading-snug">{t.lastMsg}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[t.status]}`}>
                      {t.status}
                    </span>
                    {t.unread > 0 && (
                      <span className="w-4 h-4 bg-[#1c1c1e] text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                        {t.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#e5e4e0] px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {activeThread.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-[#1c1c1e]">{activeThread.landlord}</p>
            <p className="text-[12px] text-[#6c6a66]">{activeThread.listing} · {activeThread.address}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColors[activeThread.status]}`}>
            {activeThread.status}
          </span>
          <a href={`tel:${activeThread.id}`}
            className="ml-1 w-8 h-8 rounded-full bg-[#f7f6f2] flex items-center justify-center text-[#6c6a66] hover:bg-[#e5e4e0] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </a>
        </div>

        {/* Tour reminder banner */}
        {activeThread.status === 'Tour scheduled' && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center gap-2.5 relative">
            <span className="text-sm">📅</span>
            <p className="text-[12px] text-blue-700 font-medium">Tour confirmed: <strong>Mon Apr 7 · 10:00 AM</strong> at {activeThread.address}</p>

            <div className="ml-auto relative">
              <button
                onClick={() => setCalDropdown(v => !v)}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Add to calendar
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {calDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCalDropdown(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-2xl shadow-xl border border-[#e5e4e0] overflow-hidden w-52" style={{ animation: 'fadeIn 0.12s ease' }}>
                    {/* Google Calendar */}
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=Tour+–+${encodeURIComponent(activeThread.listing)}&dates=20260407T100000/20260407T110000&details=In-person+tour+at+${encodeURIComponent(activeThread.address)}&location=${encodeURIComponent(activeThread.address + ', Champaign, IL')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setCalDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f6f2] transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" fill="#4285F4"/><rect x="3" y="10" width="18" height="2" fill="white"/><rect x="8" y="2" width="2" height="4" rx="1" fill="#4285F4"/><rect x="14" y="2" width="2" height="4" rx="1" fill="#4285F4"/><text x="12" y="20" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">G</text></svg>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1c1c1e]">Google Calendar</p>
                        <p className="text-[11px] text-[#6c6a66]">Opens in browser</p>
                      </div>
                      <svg className="ml-auto" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>

                    {/* Outlook */}
                    <a
                      href={`https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent('Tour – ' + activeThread.listing)}&startdt=2026-04-07T10:00:00&enddt=2026-04-07T11:00:00&body=${encodeURIComponent('In-person tour at ' + activeThread.address)}&location=${encodeURIComponent(activeThread.address + ', Champaign, IL')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setCalDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f6f2] transition-colors border-t border-[#f0efeb]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="3" fill="#0078D4"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">O</text></svg>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1c1c1e]">Outlook</p>
                        <p className="text-[11px] text-[#6c6a66]">Opens in browser</p>
                      </div>
                      <svg className="ml-auto" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                    </a>

                    {/* Apple / .ics */}
                    <button
                      onClick={() => { downloadICS(activeThread); setCalDropdown(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#f7f6f2] transition-colors border-t border-[#f0efeb] text-left"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="3" fill="#1c1c1e"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="11"></text><path d="M12 5 C10 5 8 7 8 9 C8 11 9 12 11 13 L13 13 C15 12 16 11 16 9 C16 7 14 5 12 5Z" fill="white"/><path d="M9 14 L8 19 L12 17 L16 19 L15 14" fill="white"/></svg>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1c1c1e]">Apple Calendar</p>
                        <p className="text-[11px] text-[#6c6a66]">Download .ics file</p>
                      </div>
                      <svg className="ml-auto" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[72%] ${m.from === 'me' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {m.from === 'landlord' && (
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div className="w-5 h-5 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-[8px] font-bold">
                      {activeThread.avatar[0]}
                    </div>
                    <span className="text-[11px] text-[#6c6a66] font-medium">{activeThread.landlord}</span>
                  </div>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed ${
                  m.from === 'me'
                    ? 'bg-[#1c1c1e] text-white rounded-br-md'
                    : 'bg-white text-[#1c1c1e] rounded-bl-md shadow-sm border border-[#f0efeb]'
                }`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-[#aaa]">{m.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-[#e5e4e0] px-4 py-3 flex items-end gap-3 flex-shrink-0">
          <div className="flex-1 bg-[#f7f6f2] rounded-2xl px-4 py-2.5 flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Write a message..."
              rows={1}
              className="flex-1 bg-transparent text-[14px] text-[#1c1c1e] placeholder-[#aaa] outline-none resize-none leading-relaxed"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={send}
            disabled={!input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              input.trim() ? 'bg-[#1c1c1e] text-white' : 'bg-[#e5e4e0] text-[#aaa]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
