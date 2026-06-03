import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Listing } from '@/lib/types';
import { AuthModal } from '@/components/AuthModal';
import { ListingModal } from '@/components/ListingModal';
import { PostAdModal } from '@/components/PostAdModal';
import { SafetyTips } from '@/components/SafetyTips';
import { MyListings } from '@/components/MyListings';
import { SavedListings } from '@/components/SavedListings';
import { BottomNav } from '@/components/BottomNav';
import { SearchBar } from '@/components/SearchBar';
import { useToast, Toast } from '@/components/Toast';
import { NotificationsBell } from '@/components/NotificationsBell';
import { SellerProfile } from '@/components/SellerProfile';
import { BoostModal } from '@/components/BoostModal';

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: 'SouqSS — Buy & Sell in South Sudan' },
      { name: 'description', content: "South Sudan's #1 marketplace. Buy and sell phones, cars, property, fashion and more." },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
    ],
  }),
});

const CATEGORIES = [
  { name: 'All', icon: '🌍' },
  { name: 'Real Estate', icon: '🏠', count: '4.8k' },
  { name: 'Electronics', icon: '💻', count: '6.0k' },
  { name: 'Vehicles', icon: '🚗', count: '12.8k' },
  { name: 'Fashion', icon: '👗', count: '6.6k' },
  { name: 'Home & Furniture', icon: '🛋️', count: '7.0k' },
  { name: 'Jobs', icon: '💼', count: '2.4k' },
  { name: 'Services', icon: '🔧', count: '3.1k' },
  { name: 'Food & Groceries', icon: '🍽️', count: '3.6k' },
  { name: 'Pets', icon: '🐾', count: '612' },
  { name: 'Beauty & Care', icon: '💄', count: '2.8k' },
  { name: 'Industrial', icon: '⚙️', count: '1.9k' },
];

const CITIES = ['All South Sudan', 'Juba', 'Wau', 'Malakal', 'Yei', 'Aweil', 'Bor', 'Rumbek'];
const QUICK_CHIPS = ['📱 iPhone', '🚗 Toyota', '🏠 Apartment', '☀️ Solar Panel', '⚡ Generator', '💻 MacBook'];
const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Most viewed', value: 'views' },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function ListingCard({ listing: L, onOpen, onToggleSave, saved }: {
  listing: Listing; onOpen: (l: Listing) => void;
  onToggleSave: (id: string) => void; saved: boolean;
}) {
  const bgMap: Record<string, string> = {
    'bg-peach': '#fde8de', 'bg-sky': '#ddeef8', 'bg-mint': '#ddf0e8',
    'bg-lav': '#ede8f5', 'bg-sun': '#fef3d8', 'bg-rose': '#fde8e8',
    'bg-sage': '#e8f0e8', 'bg-cream': '#f5f0e8', 'bg-steel': '#e8edf5',
  };
  return (
    <div
      onClick={() => onOpen(L)}
      className="bg-white rounded-2xl overflow-hidden border border-[#e5ddd8] cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="h-36 sm:h-44 flex items-center justify-center relative" style={{ background: bgMap[L.bg_color || 'bg-peach'] || '#fde8de' }}>
        <span className="text-5xl sm:text-6xl">{L.emoji || '🛒'}</span>
        {L.is_premium && (
          <span className="absolute top-2 left-2 bg-[#1a1a1a] text-white text-[9px] font-bold rounded-full px-2 py-0.5 flex items-center gap-0.5">⭐ PREMIUM</span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(L.id); }}
          className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:scale-110 transition-transform text-sm"
        >{saved ? '❤️' : '🔖'}</button>
        {L.is_verified && (
          <span className="absolute bottom-2 left-2 bg-white rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm">
            <span className="text-green-500">✓</span> Verified
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-[16px] font-extrabold text-[#d94f1e] leading-none mb-1">{L.price_label}</div>
        <div className="text-[12px] font-semibold text-[#1a1a1a] line-clamp-2 leading-snug mb-2">{L.title}</div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#aaa] truncate max-w-[100px]">📍 {L.location}</span>
          <span className="text-[10px] text-[#aaa]">{timeAgo(L.created_at)}</span>
        </div>
        <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#f5f0ed]">
          <span className="text-[10px] font-bold bg-[#f5f0ed] text-[#777] rounded-full px-2 py-0.5">{L.condition}</span>
          <span className="text-[10px] text-[#aaa]">👁 {L.views ?? 0}</span>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const { msg: toastMsg, toast } = useToast();
  const navigate = useNavigate();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const [activeCat, setActiveCat] = useState('All');
  const [activeCity, setActiveCity] = useState('All South Sudan');
  const [sortBy, setSortBy] = useState('newest');
  const [searchInput, setSearchInput] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [postOpen, setPostOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [myListingsOpen, setMyListingsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [bottomNav, setBottomNav] = useState<'home'|'search'|'post'|'saved'|'profile'>('home');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [sellerProfileId, setSellerProfileId] = useState<string | null>(null);
  const [boostListing, setBoostListing] = useState<Listing | null>(null);

  const filterRef = useRef<{ category?: string; search?: string; minPrice?: number; maxPrice?: number; city?: string; sort?: string }>({});
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  const loadListings = useCallback(async (filter = filterRef.current, reset = true) => {
    setLoading(true);
    const start = reset ? 0 : offset;

    let q = supabase
      .from('listings')
      .select('*, profiles(full_name, phone, rating, review_count, verified, member_since)')
      .eq('status', 'active');

    if (filter.category && filter.category !== 'All') q = q.eq('category', filter.category);
    if (filter.city && filter.city !== 'All South Sudan') q = q.ilike('location', `%${filter.city}%`);
    if (filter.search) q = q.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%,location.ilike.%${filter.search}%,category.ilike.%${filter.search}%`);
    if (filter.minPrice) q = q.gte('price', filter.minPrice);
    if (filter.maxPrice) q = q.lte('price', filter.maxPrice);

    const sort = filter.sort || 'newest';
    if (sort === 'newest') q = q.order('created_at', { ascending: false });
    else if (sort === 'price_asc') q = q.order('price', { ascending: true });
    else if (sort === 'price_desc') q = q.order('price', { ascending: false });
    else if (sort === 'views') q = q.order('views', { ascending: false });

    q = q.range(start, start + PAGE_SIZE - 1);
    const { data } = await q;
    const rows = (data || []) as Listing[];

    setListings(prev => reset ? rows : [...prev, ...rows]);
    setHasMore(rows.length === PAGE_SIZE);
    setOffset(start + rows.length);
    setLoading(false);
  }, [offset]);

  useEffect(() => { loadListings({}, true); }, []);

  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return; }
    supabase.from('saved_listings').select('listing_id').eq('user_id', user.id)
      .then(({ data }) => setSavedIds(new Set((data || []).map((r: any) => r.listing_id))));
  }, [user?.id]);

  const applyFilters = (overrides: Record<string, any> = {}) => {
    const f = {
      ...filterRef.current,
      search: searchInput || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      ...overrides,
    };
    filterRef.current = f;
    loadListings(f, true);
  };

  const handleSearch = (q: string) => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      filterRef.current = { ...filterRef.current, search: q || undefined };
      loadListings(filterRef.current, true);
    }, 300);
  };

  const handleCat = (cat: string) => {
    setActiveCat(cat);
    filterRef.current = { ...filterRef.current, category: cat === 'All' ? undefined : cat };
    loadListings(filterRef.current, true);
    setMobileSearchOpen(false);
  };

  const handleCity = (city: string) => {
    setActiveCity(city);
    filterRef.current = { ...filterRef.current, city: city === 'All South Sudan' ? undefined : city };
    loadListings(filterRef.current, true);
  };

  const handleSort = (s: string) => {
    setSortBy(s);
    filterRef.current = { ...filterRef.current, sort: s };
    loadListings(filterRef.current, true);
  };

  const toggleSave = async (id: string) => {
    if (!user) { setAuthMode('signin'); setAuthOpen(true); return; }
    const isSaved = savedIds.has(id);
    if (isSaved) {
      await supabase.from('saved_listings').delete().eq('user_id', user.id).eq('listing_id', id);
      setSavedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      toast('Removed from favourites');
    } else {
      await supabase.from('saved_listings').insert({ user_id: user.id, listing_id: id });
      setSavedIds(prev => new Set([...prev, id]));
      toast('❤️ Saved!');
    }
  };

  const openPostAd = () => {
    if (!user) { setAuthMode('signin'); setAuthOpen(true); return; }
    setPostOpen(true);
  };

  const signOut = () => { if (confirm('Sign out of SouqSS?')) supabase.auth.signOut(); };

  const userInitial = user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-[#f2ede9] pb-20 lg:pb-0" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── TOP BAR (desktop only) ── */}
      <div className="hidden lg:block bg-[#1a1a1a] text-white/60 text-xs py-1.5">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>🌍 South Sudan's #1 Marketplace</span>
            <button onClick={() => setSafetyOpen(true)} className="flex items-center gap-1 hover:text-white transition-colors">🛡️ Safety Tips</button>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <button onClick={() => { setAuthMode('signin'); setAuthOpen(true); }} className="hover:text-white transition-colors">Sign In</button>
                <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }} className="text-[#d94f1e] font-bold hover:text-orange-400 transition-colors">Create Account</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate({ to: '/profile' })} className="hover:text-white transition-colors">My Profile</button>
                <button onClick={signOut} className="hover:text-white transition-colors">Sign Out</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="bg-white border-b border-[#e5ddd8] sticky top-0 z-[200] shadow-sm">
        <div className="max-w-[1320px] mx-auto px-4 lg:px-6 flex items-center gap-3 h-[60px] lg:h-[68px]">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-[#1a1a1a] rounded-[10px] flex items-center justify-center text-lg lg:text-xl">🛍️</div>
            <span className="text-xl lg:text-2xl font-black tracking-tight">souq<span className="text-[#d94f1e]">SS</span></span>
          </div>

          {/* Desktop search */}
          <div className="hidden lg:flex flex-1 items-center bg-[#f5f0ed] border-2 border-transparent rounded-xl overflow-hidden focus-within:border-[#d94f1e] focus-within:bg-white transition-all">
            <select
              className="bg-transparent border-r border-[#e5ddd8] px-3 text-[13px] text-[#777] outline-none h-11 cursor-pointer"
              onChange={e => handleCat(e.target.value)}
              value={activeCat}
            >
              {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={handleSearch}
              className="flex-1"
            />
          </div>

          {/* Mobile: search icon + city */}
          <button
            className="lg:hidden flex items-center gap-1.5 flex-1 bg-[#f5f0ed] rounded-xl px-3 py-2 text-[13px] text-[#999]"
            onClick={() => { setMobileSearchOpen(true); setBottomNav('search'); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            {searchInput || 'Search listings…'}
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!user ? (
              <button
                onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}
                className="hidden sm:flex items-center gap-1.5 border-[1.5px] border-[#e5ddd8] bg-white rounded-[10px] px-3 py-2 text-[13px] font-semibold hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Sign In
              </button>
            ) : (
              <button
                onClick={() => navigate({ to: '/profile' })}
                className="hidden sm:flex items-center gap-2 border-[1.5px] border-[#e5ddd8] bg-white rounded-[10px] px-3 py-2 text-[13px] font-semibold hover:border-[#d94f1e] transition-colors"
              >
                <div className="w-6 h-6 bg-[#d94f1e] rounded-full flex items-center justify-center text-white text-xs font-bold">{userInitial}</div>
                <span className="hidden md:inline max-w-[80px] truncate">{userName}</span>
              </button>
            )}
            <NotificationsBell
              user={user}
              onOpenListing={async (id) => {
                const { data } = await supabase.from('listings').select('*, profiles(full_name, phone, rating, review_count, verified, member_since)').eq('id', id).single();
                if (data) setSelectedListing(data as Listing);
              }}
            />
            <button
              onClick={openPostAd}
              className="bg-[#d94f1e] text-white rounded-[10px] px-3 lg:px-4 py-2 text-[13px] font-bold flex items-center gap-1 hover:bg-[#c04418] transition-colors"
            >＋ <span className="hidden sm:inline">Post Ad</span></button>
          </div>
        </div>
      </nav>

      {/* ── MOBILE SEARCH SHEET ── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-[400] lg:hidden flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-[#f0ebe6]">
            <button onClick={() => { setMobileSearchOpen(false); setBottomNav('home'); }} className="text-2xl text-[#aaa]">←</button>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSearch={q => { handleSearch(q); setMobileSearchOpen(false); setBottomNav('home'); }}
              className="flex-1"
              autoFocus
            />
          </div>
          {/* City filter */}
          <div className="p-4 border-b border-[#f0ebe6]">
            <div className="text-[11px] font-bold text-[#999] uppercase tracking-wide mb-2">City</div>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => { handleCity(city); setMobileSearchOpen(false); setBottomNav('home'); }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${activeCity === city ? 'bg-[#d94f1e] text-white border-[#d94f1e]' : 'border-[#e5ddd8] text-[#555]'}`}
                >{city}</button>
              ))}
            </div>
          </div>
          {/* Category filter */}
          <div className="p-4 overflow-y-auto">
            <div className="text-[11px] font-bold text-[#999] uppercase tracking-wide mb-2">Category</div>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { handleCat(cat.name); setMobileSearchOpen(false); setBottomNav('home'); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${activeCat === cat.name ? 'border-[#d94f1e] bg-[#fff5f0] text-[#d94f1e]' : 'border-[#e5ddd8]'}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-semibold text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CATEGORY NAV (desktop) ── */}
      <div className="hidden lg:block bg-white border-b border-[#e5ddd8] overflow-x-auto">
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="flex whitespace-nowrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => handleCat(cat.name)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-semibold border-b-2 transition-colors flex-shrink-0 ${activeCat === cat.name ? 'border-[#d94f1e] text-[#d94f1e]' : 'border-transparent text-[#555] hover:text-[#d94f1e]'}`}
              >{cat.icon} {cat.name}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="bg-gradient-to-br from-[#1e4e1e] to-[#2d6e2d] py-8 lg:py-12 px-4 lg:px-6">
        <div className="max-w-[700px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-[11px] font-bold text-white mb-3 tracking-wide">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            SOUTH SUDAN'S #1 MARKETPLACE
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 leading-tight">
            Buy & Sell Anything in<br /><span className="text-[#fde8de]">South Sudan</span>
          </h1>
          <p className="text-white/70 text-[14px] mb-5 hidden sm:block">From Juba to every state — phones, cars, homes, jobs and more.</p>

          {/* Hero search — desktop */}
          <div className="hidden sm:flex items-center bg-white rounded-2xl overflow-hidden shadow-xl mb-4 max-w-[580px] mx-auto">
            <select
              className="bg-transparent border-r border-[#e5ddd8] px-3 py-4 text-[13px] text-[#777] outline-none cursor-pointer"
              onChange={e => handleCity(e.target.value)}
              value={activeCity}
            >
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-1 px-4 py-4 text-[14px] outline-none"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); handleSearch(e.target.value); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch(searchInput)}
            />
            <button
              onClick={() => handleSearch(searchInput)}
              className="bg-[#d94f1e] text-white px-6 py-4 text-[14px] font-bold hover:bg-[#c04418] transition-colors flex-shrink-0"
            >Search</button>
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => {
                  const q = chip.replace(/^[^\w]+/, '').split(' ')[0];
                  setSearchInput(q);
                  handleSearch(q);
                  setTimeout(() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className="bg-white/20 hover:bg-white/30 text-white text-[11px] sm:text-[12px] font-semibold rounded-full px-3 py-1.5 border border-white/30 transition-colors"
              >{chip}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-[1320px] mx-auto px-4 lg:px-6 py-5 flex gap-5">

        {/* ── SIDEBAR (desktop) ── */}
        <aside className="w-[240px] flex-shrink-0 hidden lg:flex flex-col gap-4">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-[#e5ddd8] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f5f0ed]">
              <span className="text-[13px] font-bold">Categories</span>
              <button onClick={() => handleCat('All')} className="text-[#d94f1e] text-[12px] font-semibold hover:underline">All</button>
            </div>
            {CATEGORIES.slice(1).map(cat => (
              <button
                key={cat.name}
                onClick={() => handleCat(cat.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-[#faf5f3] last:border-0 hover:bg-[#fdf7f5] transition-colors text-left ${activeCat === cat.name ? 'bg-[#fff5f0]' : ''}`}
              >
                <span className="text-lg w-6 text-center flex-shrink-0">{cat.icon}</span>
                <span className="flex-1 text-[13px] font-semibold">{cat.name}</span>
                <span className="text-[11px] text-[#777] bg-[#f5f0ed] rounded-full px-2 py-0.5">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* City filter */}
          <div className="bg-white rounded-2xl border border-[#e5ddd8] p-4">
            <div className="text-[12px] font-bold text-[#999] uppercase tracking-wide mb-3">City</div>
            <div className="space-y-1">
              {CITIES.map(city => (
                <button
                  key={city}
                  onClick={() => handleCity(city)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-semibold transition-colors ${activeCity === city ? 'bg-[#fff5f0] text-[#d94f1e]' : 'hover:bg-[#f5f0ed] text-[#555]'}`}
                >{city}</button>
              ))}
            </div>
          </div>

          {/* Price filter */}
          <div className="bg-white rounded-2xl border border-[#e5ddd8] p-4">
            <div className="text-[12px] font-bold text-[#999] uppercase tracking-wide mb-3">Price (SSP)</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input type="number" placeholder="Min" className="bg-[#f5f0ed] rounded-[10px] px-3 py-2 text-[13px] outline-none w-full focus:ring-2 focus:ring-[#d94f1e]" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
              <input type="number" placeholder="Max" className="bg-[#f5f0ed] rounded-[10px] px-3 py-2 text-[13px] outline-none w-full focus:ring-2 focus:ring-[#d94f1e]" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
            <button onClick={() => applyFilters()} className="w-full bg-[#d94f1e] text-white rounded-[10px] py-2.5 text-[13px] font-bold hover:bg-[#c04418] transition-colors">Apply Filter</button>
          </div>

          {/* Safety tips */}
          <button onClick={() => setSafetyOpen(true)} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left hover:bg-amber-100 transition-colors">
            <div className="text-lg mb-1">🛡️</div>
            <div className="text-[13px] font-bold text-amber-900">Stay Safe</div>
            <div className="text-[12px] text-amber-700 mt-0.5">Tips for safe buying & selling</div>
          </button>

          {/* Seller CTA */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-5 text-white">
            <div className="text-[11px] font-bold text-[#d94f1e] uppercase tracking-wide mb-2">Free to sell</div>
            <div className="text-[14px] font-bold mb-1">Start selling today</div>
            <p className="text-white/50 text-[12px] mb-4">No fees, no commissions.</p>
            <button onClick={openPostAd} className="w-full bg-[#d94f1e] text-white rounded-xl py-2.5 text-[13px] font-bold hover:bg-[#c04418] transition-colors">＋ Post an Ad</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Promo banner */}
          <div className="bg-gradient-to-r from-[#1e4e1e] to-[#2d6e2d] rounded-2xl p-5 lg:p-7 flex items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-white mb-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> NEW THIS WEEK
              </div>
              <h2 className="text-[16px] lg:text-xl font-extrabold text-white mb-1">🌱 Fresh produce now available</h2>
              <p className="text-white/70 text-[12px] lg:text-[14px] hidden sm:block">Order direct from Yei, Torit & Nimule farms — delivery to Juba.</p>
            </div>
            <button onClick={() => handleCat('Food & Groceries')} className="bg-white text-[#1a1a1a] rounded-full px-4 lg:px-6 py-2.5 text-[12px] lg:text-[14px] font-bold whitespace-nowrap flex-shrink-0 hover:opacity-90 transition-opacity">
              Shop Now →
            </button>
          </div>

          {/* Listings header with sort + filter */}
          <div id="listings-section">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#d94f1e] rounded-full"></div>
                <h2 className="text-[16px] font-extrabold">
                  {activeCat === 'All' ? 'Fresh Listings' : activeCat}
                  {activeCity !== 'All South Sudan' && <span className="text-[#777] font-semibold text-[14px]"> in {activeCity}</span>}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <button
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="lg:hidden flex items-center gap-1.5 border border-[#e5ddd8] bg-white rounded-lg px-3 py-1.5 text-[12px] font-semibold"
                >⚙️ Filter</button>
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={e => handleSort(e.target.value)}
                  className="border border-[#e5ddd8] bg-white rounded-lg px-3 py-1.5 text-[12px] font-semibold outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Mobile filter panel */}
            {filterOpen && (
              <div className="lg:hidden bg-white rounded-2xl border border-[#e5ddd8] p-4 mb-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input type="number" placeholder="Min price (SSP)" className="bg-[#f5f0ed] rounded-[10px] px-3 py-2.5 text-[13px] outline-none w-full" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <input type="number" placeholder="Max price (SSP)" className="bg-[#f5f0ed] rounded-[10px] px-3 py-2.5 text-[13px] outline-none w-full" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
                <button onClick={() => { applyFilters(); setFilterOpen(false); toast('Filter applied'); }} className="w-full bg-[#d94f1e] text-white rounded-[10px] py-2.5 text-[13px] font-bold">Apply Filter</button>
              </div>
            )}

            {/* Grid */}
            {loading && listings.length === 0 ? (
              <div className="text-center py-16 text-[#aaa]">
                <div className="text-4xl mb-3">⏳</div>
                <div className="font-semibold">Loading listings…</div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 text-[#aaa]">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-[15px] font-semibold mb-1">No listings found</div>
                <div className="text-[13px] mb-4">Try a different search, city, or category</div>
                <button
                  onClick={() => { setActiveCat('All'); setActiveCity('All South Sudan'); setSearchInput(''); filterRef.current = {}; loadListings({}, true); }}
                  className="bg-[#d94f1e] text-white rounded-xl px-5 py-2.5 font-bold text-[13px]"
                >Show all listings</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {listings.map(L => (
                  <ListingCard key={L.id} listing={L} onOpen={setSelectedListing} onToggleSave={toggleSave} saved={savedIds.has(L.id)} />
                ))}
              </div>
            )}

            {hasMore && listings.length > 0 && (
              <div className="text-center mt-5">
                <button
                  onClick={() => loadListings(filterRef.current, false)}
                  disabled={loading}
                  className="border-[1.5px] border-[#e5ddd8] bg-white rounded-xl px-8 py-3 text-[14px] font-bold hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors disabled:opacity-50"
                >{loading ? 'Loading…' : 'Load more listings →'}</button>
              </div>
            )}
          </div>

          {/* Seller CTA */}
          <div className="bg-gradient-to-br from-[#2c1a0e] to-[#1a0f08] rounded-2xl p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <div className="text-[11px] font-bold text-[#d94f1e] uppercase tracking-wide mb-2">For Sellers</div>
              <h2 className="text-[18px] font-extrabold text-white mb-2">Grow your business with SouqSS</h2>
              <p className="text-white/50 text-[13px]">Free listings, no commissions, reach buyers across all of South Sudan.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={openPostAd} className="bg-[#d94f1e] text-white rounded-xl px-5 py-3 text-[13px] font-bold whitespace-nowrap hover:bg-[#c04418] transition-colors">＋ Post an Ad</button>
              <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }} className="border border-white/20 text-white rounded-xl px-5 py-3 text-[13px] font-semibold whitespace-nowrap hover:bg-white/10 transition-colors">Learn more</button>
            </div>
          </div>
        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a1a1a] text-white mt-6 hidden lg:block">
        <div className="max-w-[1320px] mx-auto px-6 py-10 grid grid-cols-5 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#d94f1e] rounded-[8px] flex items-center justify-center">🛍️</div>
              <span className="text-lg font-black">souq<span className="text-[#d94f1e]">SS</span></span>
            </div>
            <p className="text-white/40 text-[12px] leading-relaxed">South Sudan's largest marketplace.</p>
            <button onClick={() => setSafetyOpen(true)} className="mt-3 text-[12px] text-amber-400 hover:underline">🛡️ Safety Tips</button>
          </div>
          {[
            { title: 'Company', links: ['About SouqSS', 'Careers', 'Blog', 'Press'] },
            { title: 'Buyers', links: ['How to Buy', 'Safety Tips', 'Buyer Protection'] },
            { title: 'Sellers', links: ['How to Sell', 'Open a Shop', 'Seller Guidelines'] },
            { title: 'Legal', links: ['Terms of Use', 'Privacy Policy', 'Report Abuse'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[12px] font-bold mb-3">{col.title}</h4>
              {col.links.map(link => <div key={link} className="text-[12px] text-white/40 mb-1.5 hover:text-white cursor-pointer transition-colors">{link}</div>)}
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-6 py-3 max-w-[1320px] mx-auto flex items-center justify-between text-[11px] text-white/30">
          <span>© 2026 SouqSS Technologies Ltd. Made with ♥ in Juba, South Sudan.</span>
        </div>
      </footer>

      {/* ── MOBILE BOTTOM NAV ── */}
      <BottomNav
        active={bottomNav}
        onHome={() => { setBottomNav('home'); setMobileSearchOpen(false); }}
        onSearch={() => { setBottomNav('search'); setMobileSearchOpen(true); }}
        onPost={() => { setBottomNav('post'); openPostAd(); }}
        onSaved={() => { setBottomNav('saved'); setSavedOpen(true); }}
        onProfile={() => {
          setBottomNav('profile');
          if (!user) { setAuthMode('signin'); setAuthOpen(true); }
          else navigate({ to: '/profile' });
        }}
        user={user}
        savedCount={savedIds.size}
      />

      {/* ── MODALS ── */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} defaultMode={authMode} />
      <ListingModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onAuthRequired={() => { setSelectedListing(null); setAuthMode('signin'); setAuthOpen(true); }}
        user={user}
        savedIds={savedIds}
        onToggleSave={toggleSave}
        onViewSeller={(id) => { setSelectedListing(null); setSellerProfileId(id); }}
        onBoost={(l) => { setSelectedListing(null); setBoostListing(l); }}
      />
      <SellerProfile
        sellerId={sellerProfileId}
        onClose={() => setSellerProfileId(null)}
        onOpenListing={(l) => { setSellerProfileId(null); setSelectedListing(l); }}
        currentUser={user}
      />
      <BoostModal
        listing={boostListing}
        onClose={() => setBoostListing(null)}
        user={user}
        onSuccess={() => { toast('🚀 Boost activated!'); loadListings({}, true); }}
      />
      <PostAdModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        user={user}
        onSuccess={() => { toast('✓ Your listing is live!'); loadListings({}, true); }}
      />
      <SafetyTips open={safetyOpen} onClose={() => setSafetyOpen(false)} />
      <MyListings open={myListingsOpen} onClose={() => setMyListingsOpen(false)} user={user} onOpenListing={setSelectedListing} />
      <SavedListings
        open={savedOpen}
        onClose={() => setSavedOpen(false)}
        user={user}
        onOpenListing={setSelectedListing}
        onAuthRequired={() => { setAuthMode('signin'); setAuthOpen(true); }}
      />
      <Toast message={toastMsg} onDone={() => {}} />
    </div>
  );
}
