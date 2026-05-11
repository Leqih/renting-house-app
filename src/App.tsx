import { useState, useEffect, useRef } from 'react';
import './index.css';
import { useIsMobile } from './hooks/useIsMobile';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import CommunityScreen from './screens/CommunityScreen';
import ListingDetailScreen from './screens/ListingDetailScreen';
import WebListingDetailScreen from './screens/web/WebListingDetailScreen';
import WebLayout from './components/web/WebLayout';
import WebHomeScreen from './screens/web/WebHomeScreen';
import WebExploreScreen from './screens/web/WebExploreScreen';
import WebCommunityScreen from './screens/web/WebCommunityScreen';
import WebMessagesScreen from './screens/web/WebMessagesScreen';
import WebListingsScreen from './screens/web/WebListingsScreen_v2';
import WebSavedScreen from './screens/web/WebSavedScreen';
import { listings } from './data/listings';

type Tab = 'home' | 'explore' | 'listings' | 'community' | 'messages' | 'saved';
const VALID_TABS: Tab[] = ['home', 'explore', 'listings', 'community', 'messages', 'saved'];

function parseHash(): { tab: Tab; listingId: number | null; listingTab: string | null } {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('listing/')) {
    const parts = hash.split('/');
    const id = parseInt(parts[1]);
    return { tab: 'listings', listingId: isNaN(id) ? null : id, listingTab: parts[2] || 'overview' };
  }
  // Support sub-paths like explore/sublease, explore/filter, listings/filter
  const base = hash.split('/')[0] as Tab;
  const tab = VALID_TABS.includes(base) ? base : 'home';
  return { tab, listingId: null, listingTab: null };
}

function setHash(hash: string) {
  if (window.location.hash !== '#' + hash) window.location.hash = hash;
}

function App() {
  const isMobile = useIsMobile();
  const initial = parseHash();
  const [activeTab, setActiveTab] = useState<Tab>(initial.tab);
  const [detailListingId, setDetailListingId] = useState<number | null>(initial.listingId);
  const [detailCollegeId, setDetailCollegeId] = useState<string | null>(null);
  const [mapListingId, setMapListingId] = useState<number | null>(null);
  const [mapSubleaseId, setMapSubleaseId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [communitySearch, setCommunitySearch] = useState('');
  const [visible, setVisible] = useState(true);
  const pendingTab = useRef<Tab | null>(null);

  // Set #home on initial load if hash is empty
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') setHash('home');
  }, []);

  // Sync state when user presses browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const { tab, listingId } = parseHash();
      setDetailListingId(listingId);
      if (tab !== activeTab) {
        setVisible(false);
        pendingTab.current = tab;
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [activeTab]);

  const toggleSave = (id: number) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const navigate = (tab: string) => {
    setHash(tab);
    if (tab === activeTab) return;
    setVisible(false);
    pendingTab.current = tab as Tab;
  };

  useEffect(() => {
    if (!visible && pendingTab.current) {
      const t = setTimeout(() => {
        setActiveTab(pendingTab.current!);
        pendingTab.current = null;
        setVisible(true);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const openListing = (id: number, collegeId?: string | null) => {
    setHash(`listing/${id}`);
    setDetailListingId(id);
    setDetailCollegeId(collegeId ?? null);
  };

  const closeListing = () => {
    setHash(activeTab);
    setDetailListingId(null);
  };

  const detailListing = detailListingId != null ? listings.find(l => l.id === detailListingId) : null;

  // ── Web (desktop) layout ──────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <>
        <style>{`
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes fadeInOverlay { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
        <WebLayout active={activeTab} onNavigate={navigate} savedCount={savedIds.size}>
          <div className="flex-1 flex flex-col overflow-hidden" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.15s ease' }}>
            {detailListing ? (
              <div className="flex flex-1 overflow-hidden" style={{ animation: 'fadeIn 0.18s ease' }}>
                <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
                <WebListingDetailScreen
                  listing={detailListing}
                  onBack={closeListing}
                  selectedCollegeId={detailCollegeId}
                  onNavigate={(tab, search?) => { if (search) setCommunitySearch(search); closeListing(); navigate(tab); }}
                  onViewOnMap={(id) => { setMapListingId(id); closeListing(); navigate('explore'); }}
                  onTabChange={(t) => setHash(`listing/${detailListingId}/${t}`)}
                  onApplyStep={(step) => setHash(`listing/${detailListingId}/apply/${step}`)}
                />
              </div>
            ) : (
              <>
                {activeTab === 'home' && <WebHomeScreen onNavigate={navigate} onViewListing={openListing} />}
                {activeTab === 'listings' && <WebListingsScreen onViewListing={openListing} savedIds={savedIds} onToggleSave={toggleSave} onViewOnMap={(id) => { setMapSubleaseId(id); setMapListingId(null); navigate('explore'); }} onNavigate={navigate} />}
                {activeTab === 'explore' && <WebExploreScreen onViewListing={openListing} onNavigate={navigate} initialListingId={mapListingId} initialSubleaseId={mapSubleaseId} savedIds={savedIds} onToggleSave={toggleSave} />}
                {activeTab === 'community' && <WebCommunityScreen initialSearch={communitySearch} onSearchConsumed={() => setCommunitySearch('')} />}
                {activeTab === 'messages' && <WebMessagesScreen />}
                {activeTab === 'saved' && <WebSavedScreen savedIds={savedIds} onToggleSave={toggleSave} onViewListing={openListing} onNavigate={navigate} />}
              </>
            )}
          </div>
        </WebLayout>
      </>
    );
  }

  // ── Mobile layout ─────────────────────────────────────────────────────────
  if (detailListing) {
    return (
      <div className="flex flex-col h-screen overflow-hidden"
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.4,0,0.2,1)' }}>
        <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <ListingDetailScreen
          listing={detailListing}
          onBack={closeListing}
          selectedCollegeId={detailCollegeId}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div
        className="flex-1 overflow-y-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        {activeTab === 'home' && <HomeScreen onNavigate={navigate} />}
        {activeTab === 'explore' && <ExploreScreen onViewListing={openListing} />}
        {activeTab === 'community' && <CommunityScreen />}
      </div>
      <BottomNav active={activeTab} onNavigate={navigate} />
    </div>
  );
}

export default App;
