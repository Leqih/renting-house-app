import type { ReactNode } from 'react'

type Tab = 'home' | 'explore' | 'listings' | 'community' | 'messages' | 'saved'

interface Props {
  active: Tab
  onNavigate: (tab: string) => void
  children: ReactNode
  savedCount?: number
}

const navItems: { id: Tab; label: string; icon: ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'listings',
    label: 'Listings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'explore',
    label: 'Explore Map',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: 'community',
    label: 'Community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
  },
]

export default function WebLayout({ active, onNavigate, children, savedCount = 0 }: Props) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#ecebe7]">
      <style>{`
        .nav-tooltip {
          position: absolute;
          left: calc(100% + 10px);
          top: 50%;
          transform: translateY(-50%);
          background: #1c1c1e;
          color: white;
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 8px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.12s ease;
          z-index: 100;
        }
        .nav-tooltip::before {
          content: '';
          position: absolute;
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: #1c1c1e;
        }
        .nav-item:hover .nav-tooltip {
          opacity: 1;
        }
      `}</style>

      {/* Sidebar — always icon-only */}
      <aside className="flex-shrink-0 flex flex-col bg-white border-r border-[#e5e4e0] z-10 w-14">
        {/* Logo */}
        <div className="border-b border-[#f0efeb] flex items-center justify-center px-3 py-4">
          <div className="w-8 h-8 rounded-lg bg-[#1c1c1e] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          {navItems.map(item => (
            <div key={item.id} className="nav-item relative">
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-center rounded-xl p-2.5 transition-all duration-150 relative ${
                  active === item.id
                    ? 'bg-[#1c1c1e] text-white'
                    : 'text-[#6c6a66] hover:bg-[#f5f4f0] hover:text-[#1c1c1e]'
                }`}
              >
                {item.icon}
                {item.id === 'saved' && savedCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#ef4444] rounded-full text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {savedCount > 9 ? '9+' : savedCount}
                  </span>
                )}
              </button>
              <div className="nav-tooltip">{item.label}{item.id === 'saved' && savedCount > 0 ? ` (${savedCount})` : ''}</div>
            </div>
          ))}
        </nav>

        {/* User avatar */}
        <div className="border-t border-[#f0efeb] px-2 py-3 flex justify-center">
          <div className="nav-item relative">
            <div className="w-8 h-8 rounded-full bg-[#1c1c1e] flex items-center justify-center text-white text-xs font-bold cursor-default">
              LQ
            </div>
            <div className="nav-tooltip">LQ · 2 saved</div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  )
}
