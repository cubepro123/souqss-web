import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logoImg from "@/assets/logo.png";
import { ListingImage } from "@/components/listing-image";

type DbListing = {
  id: string;
  title: string;
  price: number | null;
  currency: string;
  city: string | null;
  category: string;
  condition: string | null;
  images: string[];
  created_at: string;
};

type DbShop = {
  id: string;
  name: string;
  shop_type: string;
  service_category: string | null;
  city: string | null;
  logo_url: string | null;
};

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "SouqSS — Sell Faster, Buy Smarter in South Sudan" },
      { name: "description", content: "South Sudan's #1 marketplace. Buy and sell phones, cars, property, fashion, jobs and services across Juba and beyond." },
      { property: "og:title", content: "SouqSS — South Sudan's Marketplace" },
      { property: "og:description", content: "Sell faster, buy smarter. South Sudan's largest classifieds marketplace." },
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: "SouqSS — South Sudan's Marketplace" },
      { name: "twitter:description", content: "Sell faster, buy smarter. South Sudan's largest classifieds marketplace." },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "SouqSS",
          url: "/",
          description: "South Sudan's #1 classifieds marketplace. Buy and sell phones, cars, property, fashion, jobs and services.",
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: "/browse?q={search_term_string}" },
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
});

const CATEGORIES = [
  { name: "Shops", icon: "🏪" },
  { name: "For Sale", icon: "🛍️" },
  { name: "Services", icon: "🔧" },
  { name: "Real Estate", icon: "🏠" },
  { name: "Electronics", icon: "💻" },
  { name: "Vehicles", icon: "🚗" },
  { name: "Jobs", icon: "💼" },
  { name: "Food", icon: "🍽️" },
  { name: "Pets", icon: "🐾" },
  { name: "Fashion", icon: "👗" },
  { name: "Home & Furniture", icon: "🛋️" },
  { name: "Beauty & Care", icon: "💄" },
  { name: "Babies & Kids", icon: "🧸" },
  { name: "Farming", icon: "🌾" },
];

const QUICK_CHIPS = ["iPhone", "Toyota Hilux", "Apartment Juba", "Solar panel", "Generator", "Office desks"];

const CITIES = ["All South Sudan", "Juba", "Wau", "Malakal", "Yei", "Aweil", "Bor", "Rumbek"];

function Header() {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) { setUnread(0); return; }
    let active = true;
    const load = async () => {
      const { data: convs } = await supabase.from("conversations").select("id").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      const ids = convs?.map(c => c.id) ?? [];
      if (ids.length === 0) { if (active) setUnread(0); return; }
      const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).in("conversation_id", ids).neq("sender_id", user.id).is("read_at", null);
      if (active) setUnread(count ?? 0);
    };
    load();
    const ch = supabase.channel(`inbox-badge:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, load)
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [user]);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 h-16 flex items-center gap-3 sm:gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="SouqSS" className="w-9 h-9 rounded-xl shadow-[0_4px_14px_oklch(0.64_0.18_38_/_0.25)]" />
          <div className="text-[22px] font-extrabold tracking-tight leading-none">
            <span className="text-brand">souq</span><span className="text-foreground">SS</span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-[14px] font-semibold text-muted-foreground">
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          <Link to="/shops" className="hover:text-foreground">Shops</Link>
          {user && <Link to="/favorites" className="hover:text-foreground">♥ Saved</Link>}
          {user && (
            <Link to="/inbox" className="hover:text-foreground inline-flex items-center gap-1.5">
              💬 Inbox{unread > 0 && <span className="text-[11px] font-bold bg-brand text-white rounded-full px-1.5 min-w-[18px] text-center">{unread}</span>}
            </Link>
          )}
          {user && <Link to="/my-shop" className="hover:text-foreground">My shop</Link>}
          {user && <Link to="/profile" className="hover:text-foreground">My ads</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link to="/profile" className="hidden sm:inline text-[14px] font-semibold text-foreground hover:text-brand">My account</Link>
          ) : (
            <Link to="/auth" className="hidden sm:inline text-[14px] font-semibold text-muted-foreground hover:text-foreground">Sign in</Link>
          )}
          <Link to={user ? "/post-ad" : "/auth"} className="bg-brand hover:bg-brand-dark transition text-white font-bold px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl text-[14px] flex items-center gap-1.5 sm:gap-2 shadow-[0_4px_14px_oklch(0.64_0.18_38_/_0.3)]">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Post Ad</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("All South Sudan");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/browse",
      search: {
        q: query || undefined,
        city: city === "All South Sudan" ? undefined : city,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  };
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.64_0.18_38)] via-[oklch(0.58_0.17_35)] to-[oklch(0.5_0.14_30)]">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full bg-[oklch(0.55_0.14_155)]/20 blur-3xl" />

      <div className="relative max-w-[1280px] mx-auto px-4 pt-10 pb-28 sm:pt-12 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/90 text-[12px] font-semibold mb-5 border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.15_155)] animate-pulse" />
          South Sudan's marketplace
        </div>
        <h1 className="text-white text-[30px] sm:text-[44px] font-extrabold leading-[1.1] tracking-tight mb-2">
          Buy & sell anything,<br className="sm:hidden" /> <span className="italic font-semibold opacity-90">close to home.</span>
        </h1>
        <p className="text-white/80 text-[14px] sm:text-[15px] mb-6 sm:mb-7 max-w-[520px] mx-auto px-2">
          From Juba to Wau — find what you need or reach the right buyer in minutes.
        </p>

        <form onSubmit={submit} className="max-w-[720px] mx-auto bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] p-1.5 flex items-stretch gap-1.5 min-h-[52px]">
          <div className="hidden sm:flex items-center gap-2 px-3 text-foreground text-[14px] font-semibold border-r border-border whitespace-nowrap">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent outline-none font-semibold pr-2 cursor-pointer">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 min-w-0 px-3 sm:px-4 py-3 text-[16px] sm:text-[15px] outline-none bg-transparent placeholder:text-muted-foreground" placeholder="Search iPhone, Hilux…" />
          <button type="submit" className="bg-brand hover:bg-brand-dark transition text-white font-bold px-4 sm:px-7 rounded-xl flex items-center justify-center gap-2 text-[14px] min-w-[48px]" aria-label="Search">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        <div className="sm:hidden max-w-[720px] mx-auto mt-2 px-1">
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-white/15 backdrop-blur border border-white/25 text-white text-[14px] font-semibold outline-none">
            {CITIES.map((c) => <option key={c} value={c} className="text-foreground">📍 {c}</option>)}
          </select>
        </div>

        <div className="max-w-[720px] mx-auto mt-3 flex items-center justify-center gap-2 text-white/90 text-[12.5px] font-semibold flex-wrap">
          <span className="opacity-80">Price:</span>
          <input type="number" min="0" inputMode="numeric" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min" className="w-24 px-2.5 py-1.5 rounded-lg bg-white/15 backdrop-blur border border-white/25 text-white placeholder:text-white/60 outline-none focus:bg-white/25" />
          <span className="opacity-60">—</span>
          <input type="number" min="0" inputMode="numeric" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max" className="w-24 px-2.5 py-1.5 rounded-lg bg-white/15 backdrop-blur border border-white/25 text-white placeholder:text-white/60 outline-none focus:bg-white/25" />
          <span className="opacity-70 text-[11.5px]">SSP</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-white/70 text-[12px] font-semibold mr-1">Trending:</span>
          {QUICK_CHIPS.map((q) => (
            <Link key={q} to="/browse" search={{ q }} className="px-3 py-1 rounded-full bg-white/12 hover:bg-white/20 backdrop-blur text-white text-[12px] font-medium border border-white/20 transition">
              {q}
            </Link>
          ))}
        </div>
      </div>

      <svg className="absolute bottom-0 left-0 right-0 w-full text-background" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0,30 Q360,60 720,30 T1440,30 L1440,60 L0,60 Z" fill="currentColor" />
      </svg>
    </section>
  );
}

function CategoryList() {
  return (
    <aside>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-gradient-to-r from-brand-soft to-transparent">
          <h3 className="font-extrabold text-[14px] text-foreground">All Categories</h3>
          <span className="text-[11px] font-bold text-brand">{CATEGORIES.length}</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto no-scrollbar">
          {CATEGORIES.map((c, i) => (
            <Link key={c.name} to="/browse" search={{ category: c.name }} className={`group flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-brand-soft transition ${i !== CATEGORIES.length - 1 ? "border-b border-border" : ""}`}>
              <div className="w-9 h-9 rounded-xl bg-muted group-hover:bg-white flex items-center justify-center text-base shrink-0 transition">{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-foreground leading-tight group-hover:text-brand transition">{c.name}</div>
              </div>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Promo card */}
      <div className="mt-4 relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[oklch(0.3_0.05_50)] to-[oklch(0.18_0.02_50)] text-white">
        <div className="absolute -top-8 -right-6 w-32 h-32 rounded-full bg-brand/30 blur-2xl" />
        <div className="relative">
          <div className="text-[11px] font-bold tracking-widest text-brand mb-2">FOR SELLERS</div>
          <h4 className="font-extrabold text-[17px] leading-tight mb-1.5">Boost your sales with a shop</h4>
          <p className="text-white/70 text-[12px] mb-4 leading-relaxed">Create your own storefront and build trust with buyers. Free to set up.</p>
          <Link to="/my-shop" className="inline-block bg-white text-foreground font-bold text-[12.5px] px-4 py-2 rounded-lg hover:bg-brand-soft transition">Open a shop →</Link>
        </div>
      </div>
    </aside>
  );
}

function OpenShopBanner() {
  const { user } = useAuth();
  return (
    <section className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[oklch(0.55_0.16_145)] via-[oklch(0.5_0.14_140)] to-[oklch(0.4_0.12_135)] border border-[oklch(0.55_0.16_145)]/30">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[oklch(0.7_0.12_100)]/15 blur-2xl" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-7">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 text-[11px] font-bold mb-2.5 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.8_0.12_100)] animate-pulse" />
            NEW
          </div>
          <h3 className="text-white text-[20px] sm:text-[24px] font-extrabold leading-tight mb-1.5">
            Open your online shop on SouqSS
          </h3>
          <p className="text-white/75 text-[13.5px] leading-relaxed max-w-[520px]">
            Sell products or offer services — reach thousands of buyers across South Sudan. It's free to start.
          </p>
        </div>
        <Link
          to={user ? "/my-shop" : "/auth"}
          className="shrink-0 bg-white text-[oklch(0.35_0.12_135)] hover:bg-white/95 font-extrabold px-6 py-3 rounded-xl text-[14px] shadow-[0_8px_24px_-6px_rgba(0,0,0,0.25)] transition flex items-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          {user ? "Open my shop" : "Get started free"}
        </Link>
      </div>
    </section>
  );
}

function StatBanner() {
  const [stats, setStats] = useState([
    { n: "—", l: "Active ads" },
    { n: "—", l: "Trusted sellers" },
    { n: "—", l: "Cities covered" },
    { n: "—", l: "Buyer rating" },
  ]);

  useEffect(() => {
    (async () => {
      const [
        { count: listingsCount },
        { count: sellersCount },
        { data: cities },
      ] = await Promise.all([
        supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("shops").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("city").eq("status", "active").not("city", "is", null),
      ]);
      const uniqueCities = new Set(cities?.map((c) => c.city)).size;
      setStats([
        { n: listingsCount ? `${(listingsCount / 1000).toFixed(1)}k+` : "0", l: "Active ads" },
        { n: sellersCount ? `${sellersCount}+` : "0", l: "Trusted sellers" },
        { n: uniqueCities ? `${uniqueCities}` : "—", l: "Cities covered" },
        { n: "4.8★", l: "Buyer rating" },
      ]);
    })();
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 bg-card rounded-2xl border border-border overflow-hidden mb-5">
      {stats.map((s, i) => (
        <div key={s.l} className={`p-4 text-center ${i !== 0 ? "border-l border-border" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""}`}>
          <div className="text-[20px] font-extrabold text-brand">{s.n}</div>
          <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">{s.l}</div>
        </div>
      ))}
    </div>
  );
}

function FeaturedShops() {
  const [shops, setShops] = useState<DbShop[]>([]);

  useEffect(() => {
    supabase.from("shops")
      .select("id,name,shop_type,service_category,city,logo_url")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => setShops(data || []));
  }, []);

  if (shops.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-extrabold text-foreground flex items-center gap-2">🏪 Featured Shops</h2>
        <Link to="/shops" className="text-[12.5px] font-bold text-brand cursor-pointer hover:underline">See all →</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {shops.map((s) => (
          <Link key={s.id} to="/shops/$id" params={{ id: s.id }} className="min-w-[160px] bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition shrink-0">
            <div className="h-14 bg-gradient-to-br from-brand to-brand-dark" />
            <div className="px-3 pb-3">
              <div className="w-11 h-11 rounded-xl border-[3px] border-card -mt-5 bg-muted flex items-center justify-center text-xl mb-1.5">
                {s.logo_url ? <img src={s.logo_url} alt="" className="w-full h-full object-cover rounded-lg" /> : <span>{s.shop_type === "service_provider" ? "🛠️" : "🏪"}</span>}
              </div>
              <div className="text-[13px] font-bold truncate">{s.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">
                {s.shop_type === "service_provider" ? (s.service_category || "Service") : "Seller"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-white/80 mt-16">
      <div className="max-w-[1280px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="white" strokeWidth="2.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/></svg>
            </div>
            <span className="text-xl font-extrabold text-white"><span className="text-brand">souq</span>SS</span>
          </div>
          <p className="text-white/60 text-[13px] leading-relaxed">South Sudan's largest marketplace. Sell faster, buy smarter.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-[12px] uppercase tracking-wider">SouqSS</h4>
          <ul className="space-y-2 text-[13px] text-white/60">
            <li><Link to="/" className="hover:text-white">Home</Link></li>
            <li><Link to="/browse" className="hover:text-white">Browse</Link></li>
            <li><Link to="/shops" className="hover:text-white">Shops</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-[12px] uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-[13px] text-white/60">
            <li><Link to="/contact" className="hover:text-white">Help & support</Link></li>
            <li><Link to="/contact" className="hover:text-white">Report a listing</Link></li>
            <li><Link to="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-[12px] uppercase tracking-wider">Follow</h4>
          <ul className="space-y-2 text-[13px] text-white/60"><li className="hover:text-white cursor-pointer">Facebook</li><li className="hover:text-white cursor-pointer">Twitter / X</li><li className="hover:text-white cursor-pointer">Instagram</li><li className="hover:text-white cursor-pointer">YouTube</li></ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[12px] text-white/50">© {new Date().getFullYear()} SouqSS — Made with ♥ in Juba.</div>
    </footer>
  );
}

function Home() {
  const [live, setLive] = useState<DbListing[]>([]);
  useEffect(() => {
    supabase.from("listings").select("id,title,price,currency,city,category,condition,images,created_at").eq("status", "active").order("created_at", { ascending: false }).limit(24)
      .then(({ data }) => setLive(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <main className="max-w-[1280px] mx-auto px-4 -mt-14 relative z-10">
        {/* Category chip row */}
        <div className="bg-card border border-border rounded-2xl p-2 mb-5 flex gap-2 overflow-x-auto no-scrollbar shadow-sm">
          <Link to="/browse" className="px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 border-[1.5px] bg-brand border-brand text-white shadow-[0_4px_12px_oklch(0.64_0.18_38_/_0.3)]">All</Link>
          {[
            { l: "🛍️ For Sale", c: "For Sale" }, { l: "🔧 Services", c: "Services" }, { l: "🏠 Real Estate", c: "Real Estate" },
            { l: "💻 Electronics", c: "Electronics" }, { l: "🚗 Vehicles", c: "Vehicles" }, { l: "💼 Jobs", c: "Jobs" },
            { l: "🍽️ Food", c: "Food" }, { l: "🐾 Pets", c: "Pets" },
          ].map((c) => (
            <Link key={c.c} to="/browse" search={{ category: c.c }} className="px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 border-[1.5px] bg-card border-border text-muted-foreground hover:border-brand hover:text-brand transition">
              {c.l}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          <div>
            <OpenShopBanner />
            <StatBanner />
            <FeaturedShops />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-extrabold text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-brand rounded-full" />
                Fresh listings
              </h2>
              <Link to="/browse" className="text-[12.5px] font-bold text-brand hover:underline">See all →</Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {live.map((l) => (
                <Link key={l.id} to="/listings/$id" params={{ id: l.id }} className="group bg-card rounded-2xl overflow-hidden border border-border hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] transition">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <ListingImage src={l.images?.[0]} alt={l.title} />
                    <span className="absolute top-2.5 left-2.5 bg-cta text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md tracking-wider">NEW</span>
                  </div>
                  <div className="p-3">
                    <div className="text-price font-extrabold text-[15px] mb-1 tracking-tight">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                    <div className="text-[13px] font-semibold text-foreground leading-snug mb-2 line-clamp-2 min-h-[34px]">{l.title}</div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-[11.5px] text-muted-foreground truncate">{l.city || l.category}</div>
                      {l.condition && <span className="text-[10.5px] bg-brand-soft text-brand-dark px-2 py-0.5 rounded font-bold shrink-0">{l.condition}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/browse" className="inline-block bg-card border-2 border-border hover:border-brand hover:text-brand text-foreground font-bold px-8 py-3 rounded-xl text-[14px] transition">
                Browse all listings →
              </Link>
            </div>
          </div>

          {/* RIGHT: categories (desktop only — chip row above serves mobile) */}
          <div className="hidden lg:block">
            <CategoryList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
