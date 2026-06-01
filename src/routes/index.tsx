import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import type { Listing } from '@/lib/types';
import { AuthModal } from '@/components/AuthModal';
import { ListingModal } from '@/components/ListingModal';
import { PostAdModal } from '@/components/PostAdModal';
import { useToast, Toast } from '@/components/Toast';

export const Route = createFileRoute('/')(({
  component: Home,
  head: () => ({
    meta: [
      { title: 'SouqSS — Buy & Sell in South Sudan' },
      { name: 'description', content: "South Sudan's #1 marketplace. Buy and sell phones, cars, property, fashion and more across Juba and beyond." },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' },
    ],
  }),
}));

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

const QUICK_CHIPS = ['📱 iPhone', '🚗 Toyota', '🏠 Apartment', '☀️ Solar Panel', '⚡ Generator', '💻 MacBook'];

const PAGE_SIZE = 12;

function ListingCard({ listing: L, onOpen, onToggleSave, saved }: {
  listing: Listing;
  onOpen: (l: Listing) => void;
  onToggleSave: (id: string) => void;
  saved: boolean;
}) {
  const bgMap: Record<string, string> = {
    'bg-peach': '#fde8de', 'bg-sky': '#ddeef8', 'bg-mint': '#ddf0e8',
    'bg-lav': '#ede8f5', 'bg-sun': '#fef3d8', 'bg-rose': '#fde8e8',
    'bg-sage': '#e8f0e8', 'bg-cream': '#f5f0e8', 'bg-steel': '#e8edf5',
  };
  const heroBg = bgMap[L.bg_color || 'bg-peach'] || '#fde8de';

  return (
    <div
      onClick={() => onOpen(L)}
      className="bg-white rounded-2xl overflow-hidden border border-[#e5ddd8] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      <div className="h-40 flex items-center justify-center relative" style={{ background: heroBg }}>
        <span className="text-6xl">{L.emoji || '🛒'}</span>
        {L.is_premium && (
          <span className="absolute top-2.5 left-2.5 bg-[#1a1a1a] text-white text-[10px] font-bold rounded-full px-2.5 py-1 flex items-center gap-1">⭐ PREMIUM</span>
        )}
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(L.id); }}
          className="absolute top-2.5 right-2.5 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-orange-50 transition-colors text-sm"
        >{saved ? '❤️' : '🔖'}</button>
        {L.is_verified && (
          <span className="absolute bottom-2.5 left-2.5 bg-white rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm flex items-center gap-1">
            <span className="text-green-500">✓</span> Verified
          </span>
        )}
      </div>
      <div className="p-3.5">
        <div className="text-[17px] font-extrabold text-[#d94f1e] mb-1">{L.price_label}</div>
        <div className="text-[13px] font-semibold text-[#1a1a1a] line-clamp-2 leading-snug mb-2.5">{L.title}</div>
        <div className="flex items-center justify-between pt-2.5 border-t border-[#f5f0ed]">
          <span className="text-[11px] text-[#777]">📍 {L.location}</span>
          <span className="text-[11px] font-bold bg-[#fff5f0] text-[#d94f1e] rounded-full px-2 py-0.5">{L.condition}</span>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const { msg: toastMsg, toast } = useToast();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [activeFilter, setActiveFilter] = useState<{ category?: string; search?: string; minPrice?: number; maxPrice?: number }>({});
  const [activeCat, setActiveCat] = useState('All');

  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [postOpen, setPostOpen] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  // Load listings
  const loadListings = useCallback(async (filter = activeFilter, reset = true) => {
    setLoading(true);
    const start = reset ? 0 : offset;

    let q = supabase
      .from('listings')
      .select('*, profiles(full_name, phone, rating, review_count, verified, member_since)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (filter.category && filter.category !== 'All') q = q.eq('category', filter.category);
    if (filter.search) q = q.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%,location.ilike.%${filter.search}%`);
    if (filter.minPrice) q = q.gte('price', filter.minPrice);
    if (filter.maxPrice) q = q.lte('price', filter.maxPrice);

    q = q.range(start, start + PAGE_SIZE - 1);
    const { data } = await q;
    const rows = (data || []) as Listing[];

    setListings(prev => reset ? rows : [...prev, ...rows]);
    setHasMore(rows.length === PAGE_SIZE);
    setOffset(start + rows.length);
    setLoading(false);
  }, [activeFilter, offset]);

  useEffect(() => { loadListings({}, true); }, []);

  // Load saved IDs when user changes
  useEffect(() => {
    if (!user) { setSavedIds(new Set()); return; }
    supabase.from('saved_listings').select('listing_id').eq('user_id', user.id)
      .then(({ data }) => setSavedIds(new Set((data || []).map((r: any) => r.listing_id))));
  }, [user?.id]);

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
      toast('❤️ Saved to your favourites');
    }
  };

  const applySearch = (q: string) => {
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      const f = { ...activeFilter, search: q || undefined };
      setActiveFilter(f);
      loadListings(f, true);
    }, 350);
  };

  const applyCategory = (cat: string) => {
    setActiveCat(cat);
    const f = { ...activeFilter, category: cat === 'All' ? undefined : cat };
    setActiveFilter(f);
    loadListings(f, true);
  };

  const applyPriceFilter = () => {
    const f = {
      ...activeFilter,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    };
    setActiveFilter(f);
    loadListings(f, true);
    toast('Filter applied');
  };

  const openPostAd = () => {
    if (!user) { setAuthMode('signin'); setAuthOpen(true); return; }
    setPostOpen(true);
  };

  const signOut = () => { if (confirm('Sign out of SouqSS?')) supabase.auth.signOut(); };

  const userInitial = user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <div className="min-h-screen bg-[#f2ede9]" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── TOP BAR ── */}
      <div className="bg-[#1a1a1a] text-white/65 text-xs py-1.5">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>🌍 South Sudan's #1 Marketplace</span>
            <span className="hidden sm:inline">📱 Download App</span>
          </div>
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                <button onClick={() => { setAuthMode('signin'); setAuthOpen(true); }} className="hover:text-white transition-colors">Sign In</button>
                <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }} className="text-[#d94f1e] font-bold hover:text-orange-400 transition-colors">Create Account</button>
              </>
            ) : (
              <button onClick={signOut} className="hover:text-white transition-colors">Sign Out</button>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN NAV ── */}
      <nav className="bg-white border-b border-[#e5ddd8] sticky top-0 z-[200] shadow-sm">
        <div className="max-w-[1320px] mx-auto px-6 flex items-center gap-5 h-[68px]">
          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-10 h-10 bg-[#1a1a1a] rounded-[10px] flex items-center justify-center text-xl">🛍️</div>
            <span className="text-2xl font-black tracking-tight">souq<span className="text-[#d94f1e]">SS</span></span>
          </div>

          {/* Search */}
          <div className="flex-1 flex items-center bg-[#f5f0ed] border-2 border-transparent rounded-xl overflow-hidden focus-within:border-[#d94f1e] focus-within:bg-white transition-all">
            <select className="bg-transparent border-none border-r border-[#e5ddd8] px-3 py-0 text-[13px] text-[#777] outline-none h-11 cursor-pointer">
              <option>All Categories</option>
              {CATEGORIES.slice(1).map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <input
              type="text"
              placeholder="Search listings, brands, locations…"
              className="flex-1 bg-transparent border-none px-3.5 text-sm outline-none h-11"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); applySearch(e.target.value); }}
              onKeyDown={e => e.key === 'Enter' && applySearch(searchInput)}
            />
            <button
              onClick={() => applySearch(searchInput)}
              className="w-[52px] h-11 bg-[#d94f1e] flex items-center justify-center hover:bg-[#c04418] transition-colors flex-shrink-0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {!user ? (
              <button
                onClick={() => { setAuthMode('signin'); setAuthOpen(true); }}
                className="flex items-center gap-1.5 border-[1.5px] border-[#e5ddd8] bg-white rounded-[10px] px-4 py-2.5 text-[13px] font-semibold hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Sign In
              </button>
            ) : (
              <button
                onClick={signOut}
                className="flex items-center gap-2 border-[1.5px] border-[#e5ddd8] bg-white rounded-[10px] px-3 py-2 text-[13px] font-semibold hover:border-[#d94f1e] transition-colors"
              >
                <div className="w-7 h-7 bg-[#d94f1e] rounded-full flex items-center justify-center text-white text-xs font-bold">{userInitial}</div>
                <span className="hidden sm:inline max-w-[100px] truncate">{userName}</span>
              </button>
            )}
            <button
              onClick={openPostAd}
              className="bg-[#d94f1e] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-bold flex items-center gap-1.5 hover:bg-[#c04418] transition-colors"
            >＋ Post Ad</button>
          </div>
        </div>
      </nav>

      {/* ── CATEGORY NAV ── */}
      <div className="bg-white border-b border-[#e5ddd8] overflow-x-auto">
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="flex gap-0 whitespace-nowrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => applyCategory(cat.name)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-semibold border-b-2 transition-colors flex-shrink-0 ${
                  activeCat === cat.name
                    ? 'border-[#d94f1e] text-[#d94f1e]'
                    : 'border-transparent text-[#555] hover:text-[#d94f1e] hover:border-[#d94f1e]'
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO SEARCH BANNER ── */}
      <div className="bg-gradient-to-br from-[#1e4e1e] to-[#2d6e2d] py-10 px-6">
        <div className="max-w-[780px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3.5 py-1.5 text-[11px] font-bold text-white mb-4 tracking-wide">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
            SOUTH SUDAN'S #1 MARKETPLACE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
            Buy & Sell Anything in<br /><span className="text-[#fde8de]">South Sudan</span>
          </h1>
          <p className="text-white/75 text-[15px] mb-6">From Juba to every state — phones, cars, homes, jobs and more.</p>
          <div className="flex items-center bg-white rounded-2xl overflow-hidden shadow-xl mb-4 max-w-[600px] mx-auto">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="flex-1 px-5 py-4 text-[15px] outline-none"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); applySearch(e.target.value); }}
              onKeyDown={e => e.key === 'Enter' && applySearch(searchInput)}
            />
            <button
              onClick={() => applySearch(searchInput)}
              className="bg-[#d94f1e] text-white px-7 py-4 text-[15px] font-bold hover:bg-[#c04418] transition-colors flex-shrink-0"
            >Search</button>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_CHIPS.map(chip => (
              <button
                key={chip}
                onClick={() => { const q = chip.replace(/^[^\w]+/, '').split(' ')[0]; setSearchInput(q); applySearch(q); setTimeout(() => document.getElementById('listings-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
                className="bg-white/20 hover:bg-white/30 text-white text-[12px] font-semibold rounded-full px-3.5 py-1.5 border border-white/30 transition-colors"
              >{chip}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="max-w-[1320px] mx-auto px-6 py-6 flex gap-6">

        {/* ── SIDEBAR ── */}
        <aside className="w-[260px] flex-shrink-0 hidden lg:flex flex-col gap-4">
          {/* Categories */}
          <div className="bg-white rounded-2xl border border-[#e5ddd8] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#f5f0ed]">
              <span className="text-[13px] font-bold">All Categories</span>
              <span className="text-[#d94f1e] text-[13px] font-semibold cursor-pointer hover:underline" onClick={() => applyCategory('All')}>See all</span>
            </div>
            {CATEGORIES.slice(1).map(cat => (
              <button
                key={cat.name}
                onClick={() => applyCategory(cat.name)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-[#faf5f3] last:border-0 hover:bg-[#fdf7f5] transition-colors text-left ${activeCat === cat.name ? 'bg-[#fff5f0]' : ''}`}
              >
                <span className="text-xl w-7 text-center flex-shrink-0">{cat.icon}</span>
                <span className="flex-1 text-[13px] font-semibold text-[#1a1a1a]">{cat.name}</span>
                <span className="text-[11px] text-[#777] bg-[#f5f0ed] rounded-full px-2 py-0.5 font-semibold">{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Price filter */}
          <div className="bg-white rounded-2xl border border-[#e5ddd8] p-4">
            <div className="text-[12px] font-bold text-[#777] uppercase tracking-wide mb-3">Filter by Price (SSP)</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="number"
                placeholder="Min"
                className="bg-[#f5f0ed] rounded-[10px] px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#d94f1e] w-full"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="bg-[#f5f0ed] rounded-[10px] px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#d94f1e] w-full"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full bg-[#d94f1e] text-white rounded-[10px] py-2.5 text-[13px] font-bold hover:bg-[#c04418] transition-colors"
            >Apply Filter</button>
          </div>

          {/* Post ad CTA */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl p-5 text-white">
            <div className="text-[11px] font-bold text-[#d94f1e] uppercase tracking-wide mb-2">For Sellers</div>
            <div className="text-[15px] font-bold mb-2 leading-snug">Start selling today — it's free</div>
            <p className="text-white/60 text-[12px] mb-4">No fees, no commissions. Reach buyers across South Sudan.</p>
            <button onClick={openPostAd} className="w-full bg-[#d94f1e] text-white rounded-xl py-2.5 text-[13px] font-bold hover:bg-[#c04418] transition-colors">＋ Post an Ad</button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Promo banner */}
          <div className="bg-gradient-to-r from-[#1e4e1e] to-[#2d6e2d] rounded-2xl p-7 flex items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-[11px] font-bold text-white mb-3 tracking-wide">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                NEW THIS WEEK
              </div>
              <h2 className="text-xl font-extrabold text-white mb-2">🌱 Fresh produce now available</h2>
              <p className="text-white/75 text-[14px]">Order direct from Yei, Torit & Nimule farms — delivery to Juba every week.</p>
            </div>
            <button
              onClick={() => applyCategory('Food & Groceries')}
              className="bg-white text-[#1a1a1a] rounded-full px-6 py-3 text-[14px] font-bold whitespace-nowrap flex-shrink-0 hover:opacity-90 transition-opacity"
            >Shop Now →</button>
          </div>

          {/* Listings */}
          <div id="listings-section">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-[22px] bg-[#d94f1e] rounded-full"></div>
                <h2 className="text-[18px] font-extrabold">
                  {activeCat === 'All' ? 'Fresh Listings' : activeCat}
                </h2>
              </div>
              <button
                onClick={() => { setActiveCat('All'); const f = {}; setActiveFilter(f); loadListings(f, true); }}
                className="text-[13px] font-semibold text-[#d94f1e] hover:underline"
              >See all →</button>
            </div>

            {loading && listings.length === 0 ? (
              <div className="text-center py-16 text-[#aaa]">
                <div className="text-4xl mb-3">⏳</div>
                <div className="font-semibold">Loading listings…</div>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 text-[#aaa]">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-[15px] font-semibold mb-1">No listings found</div>
                <div className="text-[13px] mb-4">Try a different search or category</div>
                <button
                  onClick={() => { setActiveCat('All'); setSearchInput(''); setActiveFilter({}); loadListings({}, true); }}
                  className="bg-[#d94f1e] text-white rounded-xl px-5 py-2.5 font-bold text-[13px] hover:bg-[#c04418] transition-colors"
                >Show all listings</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                {listings.map(L => (
                  <ListingCard
                    key={L.id}
                    listing={L}
                    onOpen={setSelectedListing}
                    onToggleSave={toggleSave}
                    saved={savedIds.has(L.id)}
                  />
                ))}
              </div>
            )}

            {/* Load more */}
            {hasMore && listings.length > 0 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => loadListings(activeFilter, false)}
                  disabled={loading}
                  className="border-[1.5px] border-[#e5ddd8] bg-white rounded-xl px-9 py-3.5 text-[14px] font-bold hover:border-[#d94f1e] hover:text-[#d94f1e] transition-colors disabled:opacity-60"
                >{loading ? 'Loading…' : 'Load more listings →'}</button>
              </div>
            )}
          </div>

          {/* Seller CTA */}
          <div className="bg-gradient-to-br from-[#2c1a0e] to-[#1a0f08] rounded-2xl p-8 flex items-center justify-between gap-6">
            <div>
              <div className="text-[11px] font-bold text-[#d94f1e] uppercase tracking-wide mb-2">For Sellers</div>
              <h2 className="text-xl font-extrabold text-white mb-2">Grow your business with SouqSS</h2>
              <p className="text-white/60 text-[14px]">Create a free shop, manage all your listings in one place, and reach buyers from every corner of South Sudan. No monthly fees, no commissions.</p>
            </div>
            <div className="flex flex-col gap-3 flex-shrink-0">
              <button onClick={openPostAd} className="bg-[#d94f1e] text-white rounded-xl px-6 py-3 text-[14px] font-bold whitespace-nowrap hover:bg-[#c04418] transition-colors">＋ Post an Ad</button>
              <button onClick={() => { setAuthMode('signup'); setAuthOpen(true); }} className="border border-white/30 text-white rounded-xl px-6 py-3 text-[14px] font-semibold whitespace-nowrap hover:bg-white/10 transition-colors">Learn more</button>
            </div>
          </div>

        </main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#1a1a1a] text-white mt-12">
        <div className="max-w-[1320px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-[#d94f1e] rounded-[10px] flex items-center justify-center text-xl">🛍️</div>
              <span className="text-xl font-black">souq<span className="text-[#d94f1e]">SS</span></span>
            </div>
            <p className="text-white/50 text-[13px] leading-relaxed">South Sudan's largest marketplace. Sell faster, buy smarter.</p>
          </div>
          {[
            { title: 'Company', links: ['About SouqSS', 'Press & Media', 'Careers', 'Blog', 'Contact Us'] },
            { title: 'Buyers', links: ['How to Buy', 'Safety Tips', 'Buyer Protection', 'Verified Sellers'] },
            { title: 'Sellers', links: ['How to Sell', 'Open a Shop', 'Pricing & Plans', 'Seller Guidelines'] },
            { title: 'Legal', links: ['Terms of Use', 'Privacy Policy', 'Cookie Policy', 'Report Abuse'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="text-[13px] font-bold mb-3 text-white">{col.title}</h4>
              {col.links.map(link => (
                <div key={link} className="text-[13px] text-white/50 mb-2 hover:text-white cursor-pointer transition-colors">{link}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 px-6 py-4 max-w-[1320px] mx-auto flex items-center justify-between text-[12px] text-white/40">
          <span>© 2026 SouqSS Technologies Ltd. Made with ♥ in Juba, South Sudan.</span>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Privacy</span>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultMode={authMode}
      />
      <ListingModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onAuthRequired={() => { setSelectedListing(null); setAuthMode('signin'); setAuthOpen(true); }}
        user={user}
        savedIds={savedIds}
        onToggleSave={toggleSave}
      />
      <PostAdModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        user={user}
        onSuccess={() => { toast('✓ Your listing is live!'); loadListings({}, true); }}
      />
      <Toast message={toastMsg} onDone={() => {}} />
    </div>
  );
}
