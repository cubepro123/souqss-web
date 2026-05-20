import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "SouqSS — South Sudan's Marketplace" },
      { name: "description", content: "Buy and sell anything in South Sudan. Electronics, vehicles, property, fashion, jobs and services across Juba and beyond." },
      { property: "og:title", content: "SouqSS — South Sudan's Marketplace" },
      { property: "og:description", content: "Buy and sell anything in South Sudan." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
    ],
  }),
});

type Listing = {
  id: number;
  emoji: string;
  bg: string;
  title: string;
  price: string;
  location: string;
  time: string;
  badge?: "sell" | "svc" | "job";
  cat: string;
};

const CATEGORIES = [
  { key: "all", label: "All", icon: "🏠" },
  { key: "electronics", label: "Electronics", icon: "📱" },
  { key: "vehicles", label: "Vehicles", icon: "🚗" },
  { key: "property", label: "Property", icon: "🏘️" },
  { key: "fashion", label: "Fashion", icon: "👗" },
  { key: "services", label: "Services", icon: "🔧" },
  { key: "jobs", label: "Jobs", icon: "💼" },
  { key: "food", label: "Food", icon: "🍎" },
  { key: "furniture", label: "Furniture", icon: "🛋️" },
];

const TRENDING = ["iPhone 14", "Toyota Hilux", "Apartment Juba", "Solar panels", "Generator", "Office desks", "Web design", "Land Hai Cinema"];

const SHOPS = [
  { name: "Nile Electronics", cat: "Electronics", logo: "📱", grad: "from-[#D4522B] to-[#E8754D]" },
  { name: "Juba Motors", cat: "Vehicles", logo: "🚗", grad: "from-[#2B7A4B] to-[#3AA368]" },
  { name: "Mama Akon Fashion", cat: "Fashion", logo: "👗", grad: "from-[#C9920A] to-[#E8B23A]" },
  { name: "Equatoria Builders", cat: "Services", logo: "🔧", grad: "from-[#1C3BAA] to-[#3B5BD9]" },
  { name: "Green Farm SS", cat: "Food", logo: "🥬", grad: "from-[#2B7A4B] to-[#5BB87A]" },
  { name: "Konyo Konyo Mart", cat: "General", logo: "🛍️", grad: "from-[#D4522B] to-[#C9920A]" },
];

const LISTINGS: Listing[] = [
  { id: 1, emoji: "📱", bg: "bg-[#FDE8DF]", title: "iPhone 14 Pro Max 256GB, sealed in box", price: "SSP 1,250,000", location: "Juba, Hai Cinema", time: "2h ago", badge: "sell", cat: "electronics" },
  { id: 2, emoji: "🚙", bg: "bg-[#DCE9FA]", title: "Toyota Hilux 2018, double cabin, low mileage", price: "SSP 38,000,000", location: "Juba, Tongping", time: "4h ago", badge: "sell", cat: "vehicles" },
  { id: 3, emoji: "🏘️", bg: "bg-[#DDF2E8]", title: "3-bedroom apartment, fully furnished, Hai Malakal", price: "SSP 450,000/mo", location: "Juba, Hai Malakal", time: "1d ago", badge: "sell", cat: "property" },
  { id: 4, emoji: "👗", bg: "bg-[#EDE2FA]", title: "Traditional Toposa wedding dress, custom tailoring", price: "SSP 85,000", location: "Juba, Konyo Konyo", time: "5h ago", badge: "sell", cat: "fashion" },
  { id: 5, emoji: "🔧", bg: "bg-[#E0EDE4]", title: "Solar installation & maintenance — certified team", price: "From SSP 120,000", location: "Greater Juba", time: "1d ago", badge: "svc", cat: "services" },
  { id: 6, emoji: "💼", bg: "bg-[#FEF3D2]", title: "Hiring: Sales Associate at Nile Electronics", price: "SSP 200,000/mo", location: "Juba, Custom Market", time: "3h ago", badge: "job", cat: "jobs" },
  { id: 7, emoji: "🛋️", bg: "bg-[#FDE8DF]", title: "L-shaped leather sofa set, barely used", price: "SSP 320,000", location: "Juba, Munuki", time: "6h ago", badge: "sell", cat: "furniture" },
  { id: 8, emoji: "🥭", bg: "bg-[#FEF3D2]", title: "Fresh mangoes — direct from Yei farm (50kg)", price: "SSP 28,000", location: "Yei → Juba delivery", time: "9h ago", badge: "sell", cat: "food" },
  { id: 9, emoji: "💻", bg: "bg-[#DCE9FA]", title: "MacBook Pro M2 16-inch, AppleCare included", price: "SSP 2,400,000", location: "Juba, Thongping", time: "8h ago", badge: "sell", cat: "electronics" },
];

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
      <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-white fill-none" strokeWidth="2.2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      </div>
      <div className="text-[20px] font-extrabold text-brand tracking-tight">Souq<span className="text-brand-2">SS</span></div>
    </a>
  );
}

function NavItem({ icon, label, active, badge }: { icon: React.ReactNode; label: string; active?: boolean; badge?: string }) {
  return (
    <button className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-left text-[14px] font-semibold mb-0.5 transition-colors ${active ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
      <span className="w-[18px] h-[18px] shrink-0">{icon}</span>
      <span>{label}</span>
      {badge && <span className="ml-auto bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

const ICON = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  msg: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  saved: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  list: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  dash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  gear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

function Sidebar() {
  return (
    <aside className="w-[240px] shrink-0 bg-card border-r border-border flex flex-col overflow-hidden">
      <Logo />
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 pt-3">
        <div className="text-[10px] font-bold text-[#C0B8B0] uppercase tracking-[1.2px] px-2 pt-2 pb-1">Browse</div>
        <NavItem icon={ICON.home} label="Home" active />
        <NavItem icon={ICON.msg} label="Messages" badge="3" />
        <NavItem icon={ICON.saved} label="Saved" />
        <div className="text-[10px] font-bold text-[#C0B8B0] uppercase tracking-[1.2px] px-2 pt-3 pb-1">Sell</div>
        <NavItem icon={ICON.plus} label="Post Ad" />
        <NavItem icon={ICON.list} label="My Listings" />
        <NavItem icon={ICON.dash} label="Dashboard" />
        <div className="text-[10px] font-bold text-[#C0B8B0] uppercase tracking-[1.2px] px-2 pt-3 pb-1">Account</div>
        <NavItem icon={ICON.user} label="Profile" />
        <NavItem icon={ICON.gear} label="Settings" />
      </nav>
      <button className="mx-3 mt-3 mb-3 py-3 bg-brand text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(212,82,43,0.3)] hover:opacity-95 transition">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-white fill-none" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Post an Ad
      </button>
      <div className="mx-3 mb-4 p-3 rounded-2xl bg-muted border border-border flex items-center gap-2.5 cursor-pointer hover:bg-brand/5 transition">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-[#E8754D] flex items-center justify-center text-white font-extrabold text-[13px]">JM</div>
        <div className="min-w-0">
          <div className="text-[13px] font-bold leading-tight">John Mayom</div>
          <div className="text-[11px] text-muted-foreground mt-px">📍 Juba</div>
        </div>
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-muted-foreground fill-none ml-auto opacity-40" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="h-[60px] shrink-0 bg-card border-b border-border flex items-center gap-3.5 px-6">
      <div className="flex-1 max-w-[520px] flex items-center gap-2.5 bg-muted border-[1.5px] border-border rounded-xl px-3.5 py-2.5 focus-within:border-brand transition">
        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-[#B0A89E] fill-none shrink-0" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input className="border-none outline-none bg-transparent text-[14px] flex-1 placeholder:text-[#C0B8B0]" placeholder="Search ads, shops, services in South Sudan…" />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-muted border border-border rounded-[10px] text-[12px] font-bold text-muted-foreground hover:bg-border transition whitespace-nowrap">
          📍 <span>Juba</span>
          <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-current fill-none" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <button className="relative w-9 h-9 bg-muted border border-border rounded-[10px] flex items-center justify-center hover:bg-border transition">
          <svg viewBox="0 0 24 24" className="w-[17px] h-[17px] stroke-muted-foreground fill-none" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-brand rounded-full border-2 border-card" />
        </button>
      </div>
    </div>
  );
}

function ListingCard({ l }: { l: Listing }) {
  const badgeStyle = l.badge === "sell" ? "bg-brand text-white" : l.badge === "svc" ? "bg-brand-2 text-white" : "bg-gold text-white";
  const badgeLabel = l.badge === "sell" ? "For Sale" : l.badge === "svc" ? "Service" : "Job";
  return (
    <article className="bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition">
      <div className={`relative w-full aspect-square flex items-center justify-center text-[2.6rem] ${l.bg}`}>
        <span>{l.emoji}</span>
        <span className={`absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeStyle}`}>{badgeLabel}</span>
        <button className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition" aria-label="Save">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-muted-foreground fill-none" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
        </button>
      </div>
      <div className="px-3 pt-2.5 pb-3">
        <div className="text-[15px] font-extrabold mb-1 text-brand">{l.price}</div>
        <div className="text-[13px] font-medium leading-snug mb-1.5 line-clamp-2">{l.title}</div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <span>📍 {l.location}</span>
          <span>·</span>
          <span>{l.time}</span>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? LISTINGS : LISTINGS.filter((l) => l.cat === cat);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] h-full">
            {/* Feed */}
            <div className="overflow-y-auto thin-scrollbar p-6">
              <h1 className="sr-only">SouqSS — South Sudan's Marketplace</h1>

              {/* Category chips */}
              <div className="flex gap-2 flex-wrap mb-5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => setCat(c.key)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition ${
                      cat === c.key
                        ? "bg-brand border-brand text-white"
                        : "bg-card border-border text-muted-foreground hover:border-brand hover:text-brand"
                    }`}
                  >
                    <span>{c.icon}</span> {c.label}
                  </button>
                ))}
              </div>

              {/* Filter bar */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] border-border bg-card text-muted-foreground hover:border-brand hover:text-brand">
                  💰 Price
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] border-border bg-card text-muted-foreground hover:border-brand hover:text-brand">
                  🤝 Negotiable
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] border-border bg-card text-muted-foreground hover:border-brand hover:text-brand">
                  ✅ Verified
                </button>
                <div className="ml-auto flex gap-2">
                  <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] border-border bg-card text-muted-foreground">
                    Sort: Newest
                  </button>
                </div>
              </div>

              {/* Trending */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-[13px] font-bold text-muted-foreground uppercase tracking-wide">🔥 Trending</div>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6">
                {TRENDING.map((t) => (
                  <button key={t} className="flex items-center gap-1.5 px-3.5 py-2 bg-card border-[1.5px] border-border rounded-full text-[12px] font-semibold text-muted-foreground whitespace-nowrap shrink-0 hover:border-brand hover:text-brand transition">
                    {t}
                  </button>
                ))}
              </div>

              {/* Featured shops */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-[13px] font-bold text-muted-foreground uppercase tracking-wide">🏪 Featured Shops</div>
                <a className="text-[12px] font-semibold text-brand cursor-pointer hover:underline">See all →</a>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 mb-6">
                {SHOPS.map((s) => (
                  <div key={s.name} className="min-w-[140px] bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-0.5 transition shrink-0">
                    <div className={`h-[52px] bg-gradient-to-br ${s.grad}`} />
                    <div className="px-2.5 pb-3">
                      <div className="w-10 h-10 rounded-xl border-[2.5px] border-card -mt-[18px] bg-muted flex items-center justify-center text-lg mb-1.5">{s.logo}</div>
                      <div className="text-[12px] font-bold truncate">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground mt-px">{s.cat}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Listings */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="text-[13px] font-bold text-muted-foreground uppercase tracking-wide">Latest Ads</div>
                <a className="text-[12px] font-semibold text-brand cursor-pointer hover:underline">View all →</a>
              </div>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
                {filtered.map((l) => <ListingCard key={l.id} l={l} />)}
              </div>
            </div>

            {/* Right sidebar */}
            <aside className="hidden lg:block border-l border-border p-5 overflow-y-auto no-scrollbar bg-card">
              <div className="bg-muted border border-border rounded-2xl p-4 mb-5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Your Activity</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { n: "4", l: "Active Ads" },
                    { n: "12", l: "Saved" },
                    { n: "238", l: "Ad Views" },
                    { n: "3", l: "Messages" },
                  ].map((s) => (
                    <div key={s.l} className="bg-card border border-border rounded-xl p-3">
                      <div className="text-[20px] font-extrabold text-brand">{s.n}</div>
                      <div className="text-[10px] text-muted-foreground mt-px font-medium">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-[#1C3BAA] to-[#2B4AC8] rounded-2xl p-5 mb-5">
                <div className="absolute -top-5 -right-5 w-[90px] h-[90px] rounded-full bg-white/10" />
                <div className="text-[14px] font-extrabold text-white mb-1 relative">⭐ Go Premium</div>
                <div className="text-[11px] text-white/70 mb-3.5 leading-relaxed relative">Boost your ads and get a verified badge. 30-day free trial available.</div>
                <button className="relative bg-white text-[#2B4AC8] rounded-lg px-4 py-2 text-[12px] font-bold hover:opacity-90 transition">Upgrade →</button>
              </div>

              <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-3">Recent Activity</div>
              <div>
                {[
                  { i: "💬", t: "New message from Akon J.", time: "12m ago", bg: "bg-[#FDE8DF]" },
                  { i: "👁️", t: "Your iPhone 14 ad got 38 views today", time: "1h ago", bg: "bg-[#DCE9FA]" },
                  { i: "❤️", t: "Mary saved your Hilux listing", time: "3h ago", bg: "bg-[#EDE2FA]" },
                  { i: "✅", t: "Your shop verification was approved", time: "Yesterday", bg: "bg-[#DDF2E8]" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-3 border-b border-border last:border-b-0">
                    <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 text-sm ${a.bg}`}>{a.i}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-semibold leading-snug mb-px">{a.t}</div>
                      <div className="text-[10px] text-muted-foreground">{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
