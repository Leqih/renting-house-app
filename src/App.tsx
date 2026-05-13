import { useState, useEffect, useRef } from 'react';
import './index.css';
import BottomNav from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import CommunityScreen from './screens/CommunityScreen';
import ListingDetailScreen from './screens/ListingDetailScreen';
import { listings } from './data/listings';

type Tab = 'home' | 'explore' | 'community';
const VALID_TABS: Tab[] = ['home', 'explore', 'community'];

function parseHash(): { tab: Tab; listingId: number | null } {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('listing/')) {
    const id = parseInt(hash.split('/')[1]);
    return { tab: 'home', listingId: isNaN(id) ? null : id };
  }
  const base = hash.split('/')[0] as Tab;
  const tab = VALID_TABS.includes(base) ? base : 'home';
  return { tab, listingId: null };
}

function setHash(hash: string) {
  if (window.location.hash !== '#' + hash) window.location.hash = hash;
}

function App() {
  const initial = parseHash();
  const [activeTab, setActiveTab] = useState<Tab>(initial.tab);
  const [detailListingId, setDetailListingId] = useState<number | null>(initial.listingId);
  const [detailCollegeId, setDetailCollegeId] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const pendingTab = useRef<Tab | null>(null);

  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') setHash('home');
  }, []);

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
