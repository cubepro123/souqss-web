import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logoImg from "@/assets/logo.png";

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

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "SouqSS — Sell Faster, Buy Smarter in South Sudan" },
      { name: "description", content: "South Sudan's #1 marketplace. Buy and sell phones, cars, property, fashion, jobs and services across Juba and beyond." },
      { property: "og:title", content: "SouqSS — South Sudan's Marketplace" },
      { property: "og:description", content: "Sell faster, buy smarter. South Sudan's largest classifieds marketplace." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
  }),
});

const CATEGORIES = [
  { name: "Shops", count: "1,240", icon: "🏪" },
  { name: "For Sale", count: "18,930", icon: "🛍️" },
  { name: "Services", count: "4,302", icon: "🔧" },
  { name: "Real Estate", count: "4,886", icon: "🏠" },
  { name: "Electronics", count: "6,072", icon: "💻" },
  { name: "Vehicles", count: "12,837", icon: "🚗" },
  { name: "Jobs", count: "2,431", icon: "💼" },
  { name: "Food", count: "3,646", icon: "🍽️" },
  { name: "Pets", count: "612", icon: "🐾" },
  { name: "Fashion", count: "6,629", icon: "👗" },
  { name: "Home & Furniture", count: "7,045", icon: "🛋️" },
  { name: "Beauty & Care", count: "2,850", icon: "💄" },
  { name: "Babies & Kids", count: "1,857", icon: "🧸" },
  { name: "Farming", count: "1,420", icon: "🌾" },
];


const QUICK_CHIPS = ["iPhone", "Toyota Hilux", "Apartment Juba", "Solar panel", "Generator", "Office desks"];

const CITIES = ["All South Sudan", "Juba", "Wau", "Malakal", "Yei", "Aweil", "Bor", "Rumbek"];

type Ad = {
  title: string;
  price: string;
  location: string;
  emoji: string;
  bg: string;
  verified?: boolean;
  premium?: boolean;
  badge?: string;
  condition?: string;
};

const ADS: Ad[] = [
  { title: "iPhone 14 Pro Max 256GB — sealed in box", price: "SSP 1,250,000", location: "Juba, Hai Cinema", emoji: "📱", bg: "bg-[#FDE8DF]", verified: true, premium: true, condition: "Brand New" },
  { title: "Toyota Hilux 2018 Double Cabin, low mileage", price: "SSP 38,000,000", location: "Juba, Tongping", emoji: "🚙", bg: "bg-[#DCE9FA]", verified: true, badge: "Top Seller", condition: "Used" },
  { title: "3-Bedroom apartment fully furnished, Hai Malakal", price: "SSP 450,000/mo", location: "Juba, Hai Malakal", emoji: "🏘️", bg: "bg-[#DDF2E8]", verified: true, condition: "Long Term" },
  { title: "BMW 1 Series F20 Front Shock Mount — OEM", price: "SSP 53,000", location: "Juba, Industrial Area", emoji: "🔩", bg: "bg-[#EDE2FA]", premium: true, condition: "Brand New" },
  { title: "MacBook Pro M2 16-inch with AppleCare+", price: "SSP 2,400,000", location: "Juba, Thongping", emoji: "💻", bg: "bg-[#FEF3D2]", verified: true, condition: "Like New" },
  { title: "Solar Panel 450W Mono + free installation", price: "SSP 320,000", location: "Greater Juba", emoji: "☀️", bg: "bg-[#FEF3D2]", premium: true, badge: "Eco", condition: "Brand New" },
  { title: "Traditional wedding dress — custom tailoring", price: "SSP 85,000", location: "Juba, Konyo Konyo", emoji: "👗", bg: "bg-[#EDE2FA]", condition: "Made to order" },
  { title: "Fresh Yei mangoes 50kg crate, farm direct", price: "SSP 28,000", location: "Yei → Juba", emoji: "🥭", bg: "bg-[#FEF3D2]", verified: true, condition: "Fresh" },
  { title: "L-shape leather sofa set, 7-seater", price: "SSP 320,000", location: "Juba, Munuki", emoji: "🛋️", bg: "bg-[#FDE8DF]", condition: "Used" },
  { title: "Honda CG 125 boda boda, excellent condition", price: "SSP 1,800,000", location: "Juba, Jebel", emoji: "🏍️", bg: "bg-[#DCE9FA]", verified: true, condition: "Used" },
  { title: "Generator 5KVA Honda silent series", price: "SSP 980,000", location: "Juba, Custom Market", emoji: "🔌", bg: "bg-[#DDF2E8]", premium: true, condition: "Brand New" },
  { title: "Office desks bulk lot (10 pieces) — wood", price: "SSP 420,000", location: "Juba, Tongping", emoji: "🪑", bg: "bg-[#FDE8DF]", condition: "Used" },
];

const SHOPS = [
  { name: "Nile Electronics", cat: "Phones & Tablets", logo: "📱", color: "from-[#D4522B] to-[#E8754D]" },
  { name: "Juba Motors", cat: "Vehicles", logo: "🚗", color: "from-[#2B7A4B] to-[#3AA368]" },
  { name: "Mama Akon Fashion", cat: "Fashion", logo: "👗", color: "from-[#C9920A] to-[#E8B23A]" },
  { name: "Equatoria Builders", cat: "Services", logo: "🔧", color: "from-[#1C3BAA] to-[#3B5BD9]" },
  { name: "Green Farm SS", cat: "Food & Farming", logo: "🥬", color: "from-[#2B7A4B] to-[#5BB87A]" },
  { name: "Konyo Konyo Mart", cat: "General", logo: "🛍️", color: "from-[#D4522B] to-[#C9920A]" },
];

function Header() {
  const { user } = useAuth();
  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="SouqSS" className="w-9 h-9 rounded-xl shadow-[0_4px_14px_oklch(0.64_0.18_38_/_0.25)]" />
          <div className="text-[22px] font-extrabold tracking-tight leading-none">
            <span className="text-brand">souq</span><span className="text-foreground">SS</span>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-5 text-[14px] font-semibold text-muted-foreground">
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          {user && <Link to="/favorites" className="hover:text-foreground">♥ Saved</Link>}
          {user && <Link to="/profile" className="hover:text-foreground">My ads</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <Link to="/profile" className="hidden sm:inline text-[14px] font-semibold text-foreground hover:text-brand">My account</Link>
          ) : (
            <Link to="/auth" className="hidden sm:inline text-[14px] font-semibold text-muted-foreground hover:text-foreground">Sign in</Link>
          )}
          <Link to={user ? "/post-ad" : "/auth"} className="bg-brand hover:bg-brand-dark transition text-white font-bold px-5 py-2.5 rounded-xl text-[14px] flex items-center gap-2 shadow-[0_4px_14px_oklch(0.64_0.18_38_/_0.3)]">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Post Ad
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
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { q: query || undefined, city: city === "All South Sudan" ? undefined : city } });
  };
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[oklch(0.64_0.18_38)] via-[oklch(0.58_0.17_35)] to-[oklch(0.5_0.14_30)]">
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full bg-[oklch(0.55_0.14_155)]/20 blur-3xl" />

      <div className="relative max-w-[1280px] mx-auto px-4 pt-12 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white/90 text-[12px] font-semibold mb-5 border border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.75_0.15_155)] animate-pulse" />
          South Sudan's marketplace
        </div>
        <h1 className="text-white text-[34px] sm:text-[44px] font-extrabold leading-tight tracking-tight mb-2">
          Buy & sell anything,<br className="sm:hidden" /> <span className="italic font-semibold opacity-90">close to home.</span>
        </h1>
        <p className="text-white/80 text-[15px] mb-7 max-w-[520px] mx-auto">
          From Juba to Wau — find what you need or reach the right buyer in minutes.
        </p>

        <form onSubmit={submit} className="max-w-[720px] mx-auto bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] p-1.5 flex items-stretch gap-1.5">
          <div className="hidden sm:flex items-center gap-2 px-3 text-foreground text-[14px] font-semibold border-r border-border whitespace-nowrap">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent outline-none font-semibold pr-2 cursor-pointer">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 px-3 sm:px-4 py-3 text-[15px] outline-none bg-transparent placeholder:text-muted-foreground" placeholder="Search iPhone, Hilux, apartment…" />
          <button type="submit" className="bg-brand hover:bg-brand-dark transition text-white font-bold px-5 sm:px-7 rounded-xl flex items-center gap-2 text-[14px]" aria-label="Search">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

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
          <span className="text-[11px] font-bold text-brand">15</span>
        </div>
        <div className="max-h-[600px] overflow-y-auto no-scrollbar">
          {CATEGORIES.map((c, i) => (
            <Link key={c.name} to="/browse" search={{ category: c.name }} className={`group flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-brand-soft transition ${i !== CATEGORIES.length - 1 ? "border-b border-border" : ""}`}>
              <div className="w-9 h-9 rounded-xl bg-muted group-hover:bg-white flex items-center justify-center text-base shrink-0 transition">{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-foreground leading-tight group-hover:text-brand transition">{c.name}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{c.count} ads</div>
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
          <div className="text-[11px] font-bold tracking-widest text-brand mb-2">PREMIUM</div>
          <h4 className="font-extrabold text-[17px] leading-tight mb-1.5">Boost your ad to the top</h4>
          <p className="text-white/70 text-[12px] mb-4 leading-relaxed">Get more views with a verified seller badge. Coming soon.</p>
          <Link to="/post-ad" className="inline-block bg-white text-foreground font-bold text-[12.5px] px-4 py-2 rounded-lg hover:bg-brand-soft transition">Post an ad →</Link>
        </div>
      </div>
    </aside>
  );
}

function StatBanner() {
  const stats = [
    { n: "100k+", l: "Active ads" },
    { n: "50k+", l: "Trusted sellers" },
    { n: "12", l: "Cities covered" },
    { n: "4.8★", l: "Buyer rating" },
  ];
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
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[18px] font-extrabold text-foreground flex items-center gap-2">🏪 Featured Shops</h2>
        <a className="text-[12.5px] font-bold text-brand cursor-pointer hover:underline">See all →</a>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {SHOPS.map((s) => (
          <div key={s.name} className="min-w-[160px] bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition shrink-0">
            <div className={`h-14 bg-gradient-to-br ${s.color}`} />
            <div className="px-3 pb-3">
              <div className="w-11 h-11 rounded-xl border-[3px] border-card -mt-5 bg-muted flex items-center justify-center text-xl mb-1.5">{s.logo}</div>
              <div className="text-[13px] font-bold truncate">{s.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{s.cat}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AdCard({ ad }: { ad: Ad }) {
  return (
    <article className="group bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] transition relative">
      {ad.premium && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-foreground text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1">
          <span className="text-brand">★</span> PREMIUM
        </div>
      )}
      <div className={`relative aspect-square ${ad.bg} flex items-center justify-center text-[3.5rem]`}>
        <span className="group-hover:scale-110 transition-transform duration-300">{ad.emoji}</span>
        <button className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur flex items-center justify-center hover:bg-white shadow-sm" aria-label="Save">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-muted-foreground hover:text-brand transition" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        </button>
        {ad.badge && (
          <span className="absolute bottom-2.5 left-2.5 bg-cta text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{ad.badge}</span>
        )}
        {ad.verified && (
          <span className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-cta" fill="currentColor"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19l11-11-1.4-1.4z"/></svg>
            Verified
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-price font-extrabold text-[15px] mb-1 tracking-tight">{ad.price}</div>
        <div className="text-[13px] font-semibold text-foreground leading-snug mb-2 line-clamp-2 min-h-[34px]">{ad.title}</div>
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11.5px] text-muted-foreground flex items-center gap-1 min-w-0">
            <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span className="truncate">{ad.location}</span>
          </div>
          {ad.condition && (
            <span className="text-[10.5px] bg-brand-soft text-brand-dark px-2 py-0.5 rounded font-bold shrink-0">{ad.condition}</span>
          )}
        </div>
      </div>
    </article>
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
          <ul className="space-y-2 text-[13px] text-white/60"><li className="hover:text-white cursor-pointer">About us</li><li className="hover:text-white cursor-pointer">Press</li><li className="hover:text-white cursor-pointer">Careers</li><li className="hover:text-white cursor-pointer">Contact</li></ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-[12px] uppercase tracking-wider">Support</h4>
          <ul className="space-y-2 text-[13px] text-white/60"><li className="hover:text-white cursor-pointer">How to sell</li><li className="hover:text-white cursor-pointer">How to buy</li><li className="hover:text-white cursor-pointer">Safety tips</li><li className="hover:text-white cursor-pointer">Terms</li></ul>
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
        {/* Category chip row (from the app) */}
        <div className="bg-card border border-border rounded-2xl p-2 mb-5 flex gap-2 overflow-x-auto no-scrollbar shadow-sm">
          {[
            { l: "All", on: true },
            { l: "🏪 Shops" }, { l: "🛍️ For Sale" }, { l: "🔧 Services" }, { l: "🏠 Real Estate" },
            { l: "💻 Electronics" }, { l: "🚗 Vehicles" }, { l: "💼 Jobs" }, { l: "🍽️ Food" }, { l: "🐾 Pets" },
          ].map((c) => (
            <button
              key={c.l}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 border-[1.5px] transition ${
                c.on
                  ? "bg-brand border-brand text-white shadow-[0_4px_12px_oklch(0.64_0.18_38_/_0.3)]"
                  : "bg-card border-border text-muted-foreground hover:border-brand hover:text-brand"
              }`}
            >
              {c.l}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* LEFT: full ads + homepage */}
          <div>
            <StatBanner />
            <FeaturedShops />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-extrabold text-foreground flex items-center gap-2">
                <span className="w-1 h-6 bg-brand rounded-full" />
                Fresh listings
              </h2>
              <div className="flex items-center gap-2">
                <button className="text-[12.5px] font-bold text-brand bg-brand-soft px-3 py-1.5 rounded-full">Newest</button>
                <button className="text-[12.5px] font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full">Price ↓</button>
                <button className="text-[12.5px] font-semibold text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full">Nearby</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {live.map((l) => (
                <article key={l.id} className="group bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] transition">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    {l.images?.[0] ? (
                      <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                    )}
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
                </article>
              ))}
              {ADS.map((ad) => <AdCard key={ad.title} ad={ad} />)}
            </div>

            <div className="text-center mt-8">
              <button className="bg-card border-2 border-border hover:border-brand hover:text-brand text-foreground font-bold px-8 py-3 rounded-xl text-[14px] transition">
                Load more ads →
              </button>
            </div>
          </div>

          {/* RIGHT: categories */}
          <CategoryList />
        </div>
      </main>


      <Footer />
    </div>
  );
}
