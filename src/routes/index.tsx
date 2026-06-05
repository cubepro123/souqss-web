import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Listing } from '@/lib/types';
import { AuthModal } from '@/components/AuthModal';
import { ListingModal } from '@/components/ListingModal';
import { SafetyTips } from '@/components/SafetyTips';
import { MyListings } from '@/components/MyListings';
import { SavedListings } from '@/components/SavedListings';
import { BottomNav } from '@/components/BottomNav';
import { NotificationsBell } from '@/components/NotificationsBell';
import { SellerProfile } from '@/components/SellerProfile';
import { BoostModal } from '@/components/BoostModal';
import { useToast, Toast } from '@/components/Toast';

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      { title: "SouqSS — Buy & Sell in South Sudan" },
      { name: 'description', content: "South Sudan's #1 marketplace." },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Unbounded:wght@700;900&display=swap' },
    ],
  }),
});

const CATS = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Vehicles', icon: '🚗' },
  { name: 'Real Estate', icon: '🏠' },
  { name: 'Fashion', icon: '👗' },
  { name: 'Home & Furniture', icon: '🛋️' },
  { name: 'Food & Groceries', icon: '🍎' },
  { name: 'Industrial', icon: '⚙️' },
  { name: 'Services', icon: '🔧' },
  { name: 'Jobs', icon: '💼' },
  { name: 'Pets', icon: '🐾' },
  { name: 'Beauty & Care', icon: '💄' },
];

const CITIES = ['All South Sudan','Juba','Wau','Malakal','Yei','Aweil','Bor','Rumbek'];
const QUICK_CHIPS = ['📱 iPhone','🚗 Toyota','🏠 Apartment','⚡ Solar Panel','🔋 Generator','💻 MacBook'];
const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Most viewed', value: 'views' },
];

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function AdCard({ L, onOpen, onToggleSave, saved }: { L: Listing; onOpen: (l: Listing) => void; onToggleSave: (id: string) => void; saved: boolean }) {
  const images: string[] = (L as any).images || [];
  const hasImg = images.length > 0;

  const bgMap: Record<string, string> = {
    'bg-peach':'#fde8de','bg-sky':'#ddeef8','bg-mint':'#ddf0e8',
    'bg-lav':'#ede8f5','bg-sun':'#fef3d8','bg-rose':'#fde8e8',
    'bg-sage':'#e8f0e8','bg-cream':'#f5f0e8','bg-steel':'#e8edf5',
  };

  return (
    <div
      onClick={() => onOpen(L)}
      style={{ breakInside: 'avoid', marginBottom: 14 }}
      className="bg-white rounded-xl overflow-hidden border border-[#ede8e3] cursor-pointer hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(0,0,0,.1)] transition-all duration-200 block"
    >
      <div className="relative overflow-hidden" style={{ background: hasImg ? undefined : (bgMap[L.bg_color||'bg-peach']||'#fde8de') }}>
        {hasImg ? (
          <img src={images[0]} alt={L.title} className="w-full block object-cover transition-transform duration-300 hover:scale-[1.04]" style={{ maxHeight: 260 }} />
        ) : (
          <div className="flex items-center justify-center" style={{ height: 180, fontSize: 64 }}>{L.emoji || '🛒'}</div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {L.is_verified && <span className="text-[10.5px] px-2 py-1 rounded-md font-semibold flex items-center gap-1 bg-[rgba(232,68,10,.9)] text-white backdrop-blur-sm">✓ Verified</span>}
          {L.is_premium && <span className="text-[10.5px] px-2 py-1 rounded-md font-semibold bg-[rgba(26,18,8,.85)] text-white backdrop-blur-sm">⭐ Premium</span>}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(L.id); }}
          className="absolute top-2 right-2 w-7 h-7 bg-[rgba(255,255,255,.9)] rounded-full flex items-center justify-center text-sm hover:scale-125 transition-transform"
        >{saved ? '❤️' : '🤍'}</button>
      </div>
      <div className="p-[10px_12px_13px]">
        <div className="text-[15px] font-extrabold text-[#1a1208] mb-0.5">{L.price_label}</div>
        <div className="text-[12.5px] text-[#5a4e44] leading-snug mb-1.5 line-clamp-2">{L.title}</div>
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-[11px] bg-[#f7f4f1] px-2 py-0.5 rounded-[5px] text-[#5a4e44] border border-[#ede8e3]">{L.condition}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11.5px] text-[#9a8e84]">📍 {L.location}</div>
          <div className="text-[11px] text-[#9a8e84]">{timeAgo(L.created_at)}</div>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { msg: toastMsg, toast } = useToast();

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
  const [activeTab, setActiveTab] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [myListingsOpen, setMyListingsOpen] = useState(false);
  const [savedOpen, setSavedOpen] = useState(false);
  const [sellerProfileId, setSellerProfileId] = useState<string | null>(null);
  const [boostListing, setBoostListing] = useState<Listing | null>(null);
  const [bottomNav, setBottomNav] = useState<'home'|'search'|'post'|'saved'|'profile'>('home');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const filterRef = useRef<any>({});
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  const loadListings = useCallback(async (filter = filterRef.current, reset = true) => {
    setLoading(true);
    const start = reset ? 0 : offset;
    let q = supabase.from('listings').select('*, profiles(full_name, phone, rating, review_count, verified, member_since)').eq('status','active');
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
      .then(({ data }) => setSavedIds(new Set((data||[]).map((r:any) => r.listing_id))));
  }, [user?.id]);

  const applyFilters = (overrides: any = {}) => {
    const f = { ...filterRef.current, search: searchInput||undefined, minPrice: minPrice?parseFloat(minPrice):undefined, maxPrice: maxPrice?parseFloat(maxPrice):undefined, ...overrides };
    filterRef.current = f;
    loadListings(f, true);
  };

  const handleSearch = (q: string) => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      filterRef.current = { ...filterRef.current, search: q||undefined };
      loadListings(filterRef.current, true);
    }, 300);
  };

  const handleCat = (cat: string) => {
    setActiveCat(cat); setActiveTab(cat);
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
    navigate({ to: '/post-ad' });
  };

  const signOut = () => { if (confirm('Sign out of SouqSS?')) supabase.auth.signOut(); };

  const userInitial = user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  const CSS = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{
      --orange:#E8440A;--orange-dark:#c93a08;--orange-light:#fff1ec;
      --dark:#1a1208;--dark2:#2c2218;--text:#1a1208;--text2:#5a4e44;--text3:#9a8e84;
      --border:#ede8e3;--bg:#f7f4f1;--white:#fff;--r:12px;--topbar:#111;
    }
    body{font-family:'Plus Jakarta Sans',sans-serif;background:var(--bg);color:var(--text)}
    .ad-grid{columns:4;column-gap:14px}
    @media(max-width:1100px){.ad-grid{columns:3}}
    @media(max-width:900px){.ad-grid{columns:3}}
    @media(max-width:600px){.ad-grid{columns:2}}
    .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
    .rec-scroll,.banners,.nav-tabs-inner{scrollbar-width:none}
    .rec-scroll::-webkit-scrollbar,.banners::-webkit-scrollbar,.nav-tabs-inner::-webkit-scrollbar{display:none}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(12px)}to{opacity:1;transform:none}}
  `;

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#f7f4f1', color: '#1a1208', minHeight: '100vh', paddingBottom: 80 }}>
      <style>{CSS}</style>

      {/* ── TOP BAR ── */}
      <div style={{ background: '#111', padding: '7px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5, color: '#aaa' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }}></span>
          South Sudan's #1 Marketplace
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={() => setSafetyOpen(true)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 12.5 }}>🛡️ Safety Tips</button>
          {!user ? (
            <>
              <button onClick={() => { setAuthMode('signin'); setAuthOpen(true); }} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 12.5 }}>Sign In</button>
              <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }} style={{ background: 'none', border: 'none', color: '#E8440A', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>Create Account</button>
            </>
          ) : (
            <button onClick={signOut} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 12.5 }}>Sign Out</button>
          )}
        </div>
      </div>

      {/* ── HEADER ── */}
      <header style={{ background: '#fff', borderBottom: '1px solid #ede8e3', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <div style={{ maxWidth: 1280, margin: 'auto', padding: '0 20px', height: 66, display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, background: '#1a1208', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛍️</div>
            <span style={{ fontFamily: "'Unbounded', sans-serif", fontSize: 20, fontWeight: 900, color: '#1a1208', letterSpacing: -1 }}>
              souq<span style={{ color: '#E8440A' }}>SS</span>
            </span>
          </div>

          {/* Mobile search pill */}
          <button
            className="lg:hidden"
            onClick={() => { setMobileSearchOpen(true); setBottomNav('search'); }}
            style={{ flex: 1, background: '#f7f4f1', border: '1.5px solid #ede8e3', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#9a8e84', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}
          >🔍 {searchInput || 'Search listings…'}</button>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <NotificationsBell user={user} onOpenListing={async (id) => {
              const { data } = await supabase.from('listings').select('*, profiles(full_name, phone, rating, review_count, verified, member_since)').eq('id', id).single();
              if (data) setSelectedListing(data as Listing);
            }} />
            {!user ? (
              <button
                onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}
                className="hidden sm:flex"
                style={{ alignItems: 'center', gap: 6, background: '#f7f4f1', border: '1px solid #ede8e3', borderRadius: 9, padding: '0 16px', height: 40, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#1a1208' }}
              >Sign In</button>
            ) : (
              <div style={{ position: 'relative' }} className="hidden sm:block">
                <div
                  onClick={() => navigate({ to: '/profile' })}
                  style={{ width: 40, height: 40, borderRadius: 9, background: '#E8440A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
                >{userInitial}</div>
              </div>
            )}
            <button
              onClick={openPostAd}
              style={{ background: '#E8440A', color: '#fff', border: 'none', padding: '0 20px', height: 40, borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'background .2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#c93a08')}
              onMouseLeave={e => (e.currentTarget.style.background = '#E8440A')}
            >＋ <span className="hidden sm:inline">Post Ad</span></button>
          </div>
        </div>
      </header>

      {/* ── NAV TABS ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede8e3' }}>
        <div className="nav-tabs-inner" style={{ maxWidth: 1280, margin: 'auto', padding: '0 20px', display: 'flex', gap: 2, overflowX: 'auto' }}>
          {[{ name: 'All', icon: '🌍' }, ...CATS].map(cat => (
            <button
              key={cat.name}
              onClick={() => handleCat(cat.name)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7, padding: '12px 16px',
                fontSize: 13.5, fontWeight: activeTab === cat.name ? 600 : 500,
                color: activeTab === cat.name ? '#E8440A' : '#5a4e44',
                cursor: 'pointer', borderBottom: `2px solid ${activeTab === cat.name ? '#E8440A' : 'transparent'}`,
                whiteSpace: 'nowrap', transition: 'all .2s', background: 'none', border: 'none',
                borderBottomWidth: 2, borderBottomStyle: 'solid',
                fontFamily: 'inherit',
              }}
            ><span style={{ fontSize: 16 }}>{cat.icon}</span>{cat.name}</button>
          ))}
        </div>
      </nav>

      {/* ── MOBILE SEARCH OVERLAY ── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 bg-white z-[400] lg:hidden flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b border-[#ede8e3]">
            <button onClick={() => { setMobileSearchOpen(false); setBottomNav('home'); }} className="text-2xl text-[#9a8e84]">←</button>
            <input
              autoFocus
              type="text"
              placeholder="Search listings…"
              className="flex-1 bg-[#f7f4f1] rounded-xl px-4 py-3 text-[14px] outline-none"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); handleSearch(e.target.value); }}
              onKeyDown={e => { if (e.key === 'Enter') { setMobileSearchOpen(false); setBottomNav('home'); } }}
            />
          </div>
          <div className="p-4 border-b border-[#ede8e3]">
            <div className="text-[11px] font-bold text-[#9a8e84] uppercase tracking-wide mb-2">City</div>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(city => (
                <button key={city} onClick={() => { handleCity(city); setMobileSearchOpen(false); setBottomNav('home'); }}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${activeCity === city ? 'bg-[#E8440A] text-white border-[#E8440A]' : 'border-[#ede8e3] text-[#5a4e44]'}`}
                >{city}</button>
              ))}
            </div>
          </div>
          <div className="p-4 overflow-y-auto">
            <div className="text-[11px] font-bold text-[#9a8e84] uppercase tracking-wide mb-2">Category</div>
            <div className="grid grid-cols-3 gap-2">
              {[{ name: 'All', icon: '🌍' }, ...CATS].map(cat => (
                <button key={cat.name} onClick={() => { handleCat(cat.name); setMobileSearchOpen(false); setBottomNav('home'); }}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors ${activeCat === cat.name ? 'border-[#E8440A] bg-[#fff1ec] text-[#E8440A]' : 'border-[#ede8e3]'}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-[10px] font-semibold text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg,#1a1208 0%,#2c1a0a 45%,#3d2410 100%)', padding: '44px 20px 36px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 80% at 50% 120%,rgba(232,68,10,.35) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 18, backdropFilter: 'blur(6px)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', animation: 'pulse 2s infinite', display: 'inline-block' }}></span>
          South Sudan's #1 Marketplace
        </div>
        <h1 style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 'clamp(22px,5vw,32px)', fontWeight: 900, lineHeight: 1.15, marginBottom: 8 }}>
          Buy & Sell Anything in<br /><span style={{ color: '#E8440A' }}>South Sudan</span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 15, marginBottom: 28 }}>From Juba to every state — phones, cars, homes, jobs and more.</p>
        <div className="hidden sm:flex" style={{ maxWidth: 620, margin: '0 auto 20px', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 6px 30px rgba(0,0,0,.35)' }}>
          <select
            value={activeCity}
            onChange={e => handleCity(e.target.value)}
            style={{ background: '#f5f2ef', border: 'none', padding: '0 18px', fontSize: 13, fontWeight: 600, color: '#5a4e44', cursor: 'pointer', borderRight: '1.5px solid #ede8e3', fontFamily: 'inherit', outline: 'none' }}
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            style={{ flex: 1, border: 'none', padding: 16, fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
            placeholder="What are you looking for?"
            value={searchInput}
            onChange={e => { setSearchInput(e.target.value); handleSearch(e.target.value); }}
            onKeyDown={e => e.key === 'Enter' && handleSearch(searchInput)}
          />
          <button onClick={() => handleSearch(searchInput)} style={{ background: '#E8440A', border: 'none', padding: '0 28px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Search</button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8 }}>
          {QUICK_CHIPS.map(chip => (
            <button key={chip} onClick={() => { const q = chip.replace(/^[^\w]+/,'').split(' ')[0]; setSearchInput(q); handleSearch(q); setTimeout(() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', color: 'rgba(255,255,255,.85)', padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', transition: 'all .2s', backdropFilter: 'blur(4px)', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E8440A'; e.currentTarget.style.borderColor = '#E8440A'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)'; e.currentTarget.style.color = 'rgba(255,255,255,.85)'; }}
            >{chip}</button>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div style={{ maxWidth: 1280, margin: 'auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: 24, marginTop: 28 }}>

          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:flex flex-col" style={{ width: 260, flexShrink: 0 }}>

            {/* Categories */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede8e3', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: '#9a8e84', borderBottom: '1px solid #ede8e3' }}>Categories</div>
              {CATS.map(cat => (
                <div key={cat.name} onClick={() => handleCat(cat.name)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', transition: 'background .15s', borderBottom: '1px solid #f5f2ef', background: activeCat === cat.name ? '#fff1ec' : undefined }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fff1ec')}
                  onMouseLeave={e => (e.currentTarget.style.background = activeCat === cat.name ? '#fff1ec' : '')}
                >
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff1ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{cat.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500 }}>{cat.name}</div>
                    
                  </div>
                  <div style={{ fontSize: 12, color: '#ede8e3' }}>›</div>
                </div>
              ))}
            </div>

            {/* City */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede8e3', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: '#9a8e84', borderBottom: '1px solid #ede8e3' }}>City</div>
              <div style={{ padding: '8px 0' }}>
                {CITIES.map(city => (
                  <div key={city} onClick={() => handleCity(city)}
                    style={{ padding: '9px 16px', fontSize: 13.5, cursor: 'pointer', transition: 'background .15s', borderRadius: 6, margin: '0 6px', background: activeCity === city ? '#fff1ec' : undefined, color: activeCity === city ? '#E8440A' : undefined, fontWeight: activeCity === city ? 600 : undefined }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fff1ec')}
                    onMouseLeave={e => (e.currentTarget.style.background = activeCity === city ? '#fff1ec' : '')}
                  >{city}</div>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede8e3', marginBottom: 16 }}>
              <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: '#9a8e84', borderBottom: '1px solid #ede8e3' }}>Price (SSP)</div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ flex: 1, border: '1.5px solid #ede8e3', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} onFocus={e => (e.currentTarget.style.borderColor='#E8440A')} onBlur={e => (e.currentTarget.style.borderColor='#ede8e3')} />
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ flex: 1, border: '1.5px solid #ede8e3', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none' }} onFocus={e => (e.currentTarget.style.borderColor='#E8440A')} onBlur={e => (e.currentTarget.style.borderColor='#ede8e3')} />
                </div>
                <button onClick={() => applyFilters()} style={{ width: '100%', background: '#E8440A', color: '#fff', border: 'none', padding: 10, borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Apply Filter</button>
              </div>
            </div>

            {/* Safety */}
            <div onClick={() => setSafetyOpen(true)} style={{ background: '#fffbf5', border: '1px solid #fde8c0', borderRadius: 12, padding: '14px 16px', cursor: 'pointer', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 5 }}>🛡️ Stay Safe</div>
              <p style={{ fontSize: 12.5, color: '#9a8e84', lineHeight: 1.5 }}>Tips for safe buying & selling. <span style={{ color: '#E8440A', fontWeight: 600 }}>Read more →</span></p>
            </div>

            {/* Sell CTA */}
            <div style={{ background: '#1a1208', borderRadius: 12, padding: '18px 16px', color: '#fff' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: '#E8440A', marginBottom: 6 }}>Free to sell</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Start selling today</h3>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.55)', marginBottom: 14 }}>No fees, no commissions.</p>
              <button onClick={openPostAd} style={{ background: '#E8440A', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>＋ Post an Ad</button>
            </div>
          </aside>

          {/* ── MAIN CONTENT ── */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Promo card */}
            <div style={{ background: 'linear-gradient(135deg,#1a2c18,#2a3d28)', borderRadius: 14, padding: '22px 24px', color: '#fff', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: '#7ddd6a', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }}></span>
                  New this week
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 5 }}>🌱 Fresh produce now available</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.6)' }}>Order direct from Yei, Torit & Nimule farms — delivery to Juba.</p>
              </div>
              <button onClick={() => handleCat('Food & Groceries')} style={{ background: '#fff', color: '#1a1208', border: 'none', padding: '10px 20px', borderRadius: 20, fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit', flexShrink: 0 }}>Shop Now →</button>
            </div>

            {/* Quick banners */}
            <div className="banners" style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, marginBottom: 24 }}>
              {[
                { icon: '📤', title: 'Sell for Free', bg: '#fff8f5', border: '#ffc4b0', iconBg: '#ffeae0', action: () => openPostAd() },
                { icon: '🔥', title: 'Top Deals', bg: '#fffbf0', border: '#ffd880', iconBg: '#fff2c0', action: () => { handleSort('views'); document.getElementById('listings-section')?.scrollIntoView({behavior:'smooth'}); } },
                { icon: '✨', title: 'New Listings', bg: '#f5fbf0', border: '#b0dda0', iconBg: '#d8f0cc', action: () => { handleSort('newest'); document.getElementById('listings-section')?.scrollIntoView({behavior:'smooth'}); } },
                { icon: '💰', title: 'Best Price', bg: '#f5f8ff', border: '#b8caff', iconBg: '#e0eaff', action: () => { handleSort('price_asc'); document.getElementById('listings-section')?.scrollIntoView({behavior:'smooth'}); } },
              ].map(b => (
                <div key={b.title} onClick={b.action} style={{ flexShrink: 0, width: 155, borderRadius: 14, padding: 16, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, border: `1.5px solid ${b.border}`, background: b.bg, transition: 'transform .2s, box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: b.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{b.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{b.title}</div>
                </div>
              ))}
            </div>

            {/* Category icon row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {[{ icon: '➕', name: 'Post Ad', action: openPostAd }, ...CATS.map(c => ({ icon: c.icon, name: c.name, action: () => handleCat(c.name) }))].map(item => (
                <button key={item.name} onClick={item.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 10px', background: '#fff', borderRadius: 12, cursor: 'pointer', border: '1.5px solid #ede8e3', transition: 'all .2s', minWidth: 78, fontFamily: 'inherit' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8440A'; e.currentTarget.style.background = '#fff1ec'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede8e3'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: '#fff1ec', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>{item.icon}</div>
                  <span style={{ fontSize: 11, fontWeight: 500, textAlign: 'center', color: '#5a4e44', maxWidth: 78, lineHeight: 1.3 }}>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Listings header */}
            <div id="listings-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 16, fontWeight: 700 }}>
                {activeCat === 'All' ? 'Fresh Listings' : activeCat}
                {activeCity !== 'All South Sudan' && <span style={{ color: '#9a8e84', fontFamily: 'inherit', fontSize: 13, fontWeight: 500 }}> in {activeCity}</span>}
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="lg:hidden" onClick={() => setFilterOpen(!filterOpen)} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1.5px solid #ede8e3', background: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>⚙️ Filter</button>
                <select value={sortBy} onChange={e => handleSort(e.target.value)} style={{ border: '1.5px solid #ede8e3', background: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 13, fontWeight: 600, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Mobile filter panel */}
            {filterOpen && (
              <div className="lg:hidden" style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede8e3', padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <input type="number" placeholder="Min price (SSP)" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ border: '1.5px solid #ede8e3', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                  <input type="number" placeholder="Max price (SSP)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ border: '1.5px solid #ede8e3', borderRadius: 10, padding: '10px 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
                </div>
                <button onClick={() => { applyFilters(); setFilterOpen(false); toast('Filter applied'); }} style={{ width: '100%', background: '#E8440A', color: '#fff', border: 'none', padding: 10, borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Apply Filter</button>
              </div>
            )}

            {/* Ad Grid */}
            {loading && listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9a8e84' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                <div style={{ fontWeight: 600 }}>Loading listings…</div>
              </div>
            ) : listings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 52, marginBottom: 12, opacity: .4 }}>🔍</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No listings found</h3>
                <p style={{ color: '#9a8e84', marginBottom: 20 }}>Try a different search, city, or category</p>
                <button onClick={() => { setActiveCat('All'); setActiveTab('All'); setActiveCity('All South Sudan'); setSearchInput(''); filterRef.current = {}; loadListings({}, true); }} style={{ background: '#E8440A', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Show all listings</button>
              </div>
            ) : (
              <div className="ad-grid">
                {listings.map(L => (
                  <AdCard key={L.id} L={L} onOpen={setSelectedListing} onToggleSave={toggleSave} saved={savedIds.has(L.id)} />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && listings.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button onClick={() => loadListings(filterRef.current, false)} disabled={loading}
                  style={{ border: '1.5px solid #ede8e3', background: '#fff', borderRadius: 12, padding: '12px 36px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E8440A'; e.currentTarget.style.color = '#E8440A'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#ede8e3'; e.currentTarget.style.color = ''; }}
                >{loading ? 'Loading…' : 'Load more listings →'}</button>
              </div>
            )}

            {/* Grow banner */}
            <div style={{ background: '#1a1208', borderRadius: 14, padding: '28px 32px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, margin: '28px 0' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .8, color: '#E8440A', marginBottom: 6 }}>For Sellers</div>
                <h3 style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Grow your business with SouqSS</h3>
                <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.55)' }}>Free listings, no commissions, reach buyers across all of South Sudan.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button onClick={openPostAd} style={{ background: '#E8440A', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>＋ Post an Ad</button>
                <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }} style={{ background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)', padding: '11px 22px', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>Learn more</button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="hidden lg:block" style={{ background: '#111008', color: '#888', marginTop: 60 }}>
        <div style={{ maxWidth: 1280, margin: 'auto', padding: '48px 20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: '#2c2218', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛍️</div>
            <span style={{ fontFamily: "'Unbounded',sans-serif", fontSize: 19, fontWeight: 900, color: '#fff' }}>souq<span style={{ color: '#E8440A' }}>SS</span></span>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>South Sudan's largest marketplace.</div>
          <button onClick={() => setSafetyOpen(true)} style={{ background: 'none', border: 'none', color: '#E8440A', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>🛡️ Safety Tips</button>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(4,1fr)', gap: 32, margin: '36px 0 28px' }}>
            <div />
            {[
              { title: 'Company', links: ['About SouqSS','Careers','Blog','Press'] },
              { title: 'Buyers', links: ['How to Buy','Safety Tips','Buyer Protection'] },
              { title: 'Sellers', links: ['How to Sell','Open a Shop','Seller Guidelines'] },
              { title: 'Legal', links: ['Terms of Use','Privacy Policy','Report Abuse'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ color: '#fff', fontSize: 13, fontWeight: 700, marginBottom: 14, textTransform: 'uppercase', letterSpacing: .5 }}>{col.title}</h4>
                {col.links.map(link => <div key={link} style={{ fontSize: 13, color: '#666', marginBottom: 9, cursor: 'pointer', transition: 'color .2s' }} onMouseEnter={e => (e.currentTarget.style.color='#fff')} onMouseLeave={e => (e.currentTarget.style.color='#666')}>{link}</div>)}
              </div>
            ))}
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,.07)', margin: '20px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#555' }}>
            <span>© 2026 SouqSS Technologies Ltd. Made with ♥ in Juba, South Sudan.</span>
            <span style={{ display: 'flex', gap: 16 }}>
              <span style={{ cursor: 'pointer' }}>Terms</span>
              <span style={{ cursor: 'pointer' }}>Privacy</span>
            </span>
          </div>
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
      <SafetyTips open={safetyOpen} onClose={() => setSafetyOpen(false)} />
      <MyListings open={myListingsOpen} onClose={() => setMyListingsOpen(false)} user={user} onOpenListing={setSelectedListing} />
      <SavedListings open={savedOpen} onClose={() => setSavedOpen(false)} user={user} onOpenListing={setSelectedListing} onAuthRequired={() => { setAuthMode('signin'); setAuthOpen(true); }} />
      <SellerProfile sellerId={sellerProfileId} onClose={() => setSellerProfileId(null)} onOpenListing={(l) => { setSellerProfileId(null); setSelectedListing(l); }} currentUser={user} />
      <BoostModal listing={boostListing} onClose={() => setBoostListing(null)} user={user} onSuccess={() => { toast('🚀 Boost activated!'); loadListings({}, true); }} />
      <Toast message={toastMsg} onDone={() => {}} />
    </div>
  );
}
