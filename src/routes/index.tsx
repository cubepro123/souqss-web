import { createFileRoute } from "@tanstack/react-router";

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
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
});

const CATEGORIES = [
  { name: "Vehicles", count: "12,837", icon: "🚗" },
  { name: "Property", count: "4,886", icon: "🏘️" },
  { name: "Phones & Tablets", count: "8,695", icon: "📱" },
  { name: "Electronics", count: "6,072", icon: "💻" },
  { name: "Home, Furniture & Appliances", count: "7,045", icon: "🛋️" },
  { name: "Fashion", count: "6,629", icon: "👗" },
  { name: "Beauty & Personal Care", count: "2,850", icon: "💄" },
  { name: "Services", count: "4,302", icon: "🔧" },
  { name: "Repair & Construction", count: "2,161", icon: "🛠️" },
  { name: "Commercial Equipment & Tools", count: "1,963", icon: "⚙️" },
  { name: "Leisure & Activities", count: "1,128", icon: "🎮" },
  { name: "Babies & Kids", count: "1,857", icon: "🧸" },
  { name: "Food, Agriculture & Farming", count: "3,646", icon: "🌾" },
  { name: "Jobs", count: "2,431", icon: "💼" },
  { name: "Pets", count: "612", icon: "🐕" },
];

const INFO_CARDS = [
  { title: "Niche Intelligence", bg: "bg-[#EDE2FA]", icon: "🔍" },
  { title: "Apply for job", bg: "bg-[#FEF3D2]", icon: "💼" },
  { title: "How to sell", bg: "bg-[#DDF2E8]", icon: "💰" },
  { title: "How to buy", bg: "bg-[#DCE9FA]", icon: "🛒" },
];

type Ad = {
  title: string;
  price: string;
  location: string;
  emoji: string;
  bg: string;
  verified?: boolean;
  enterprise?: boolean;
  years?: string;
  condition?: string;
  rating?: string;
};

const ADS: Ad[] = [
  { title: "iPhone 14 Pro Max 256GB", price: "SSP 1,250,000", location: "Juba, Hai Cinema", emoji: "📱", bg: "bg-[#FDE8DF]", verified: true, years: "5+ YEARS ON SOUQSS", condition: "Brand New" },
  { title: "Kenda Tires Sizes 225/45zr18", price: "SSP 95,000", location: "Juba, Custom Market", emoji: "🛞", bg: "bg-[#1a1a1a]/5", verified: true, enterprise: true, years: "5+ YEARS ON SOUQSS", condition: "Brand New" },
  { title: "235/65r17 Comforser Cf1100 All Terrain Tires", price: "SSP 130,000", location: "Juba, Ridgeways", emoji: "🛞", bg: "bg-[#2a2a2a]/5", years: "3+ YEARS ON SOUQSS", condition: "Brand New" },
  { title: "BMW 1 Series F20 Front Shock Mount", price: "SSP 53,000", location: "Juba, Industrial Area", emoji: "🔩", bg: "bg-[#DCE9FA]", verified: true, enterprise: true, rating: "4.8", condition: "Brand New" },
  { title: "Toyota Hilux 2018 Double Cabin, Low Mileage", price: "SSP 38,000,000", location: "Juba, Tongping", emoji: "🚙", bg: "bg-[#FDE8DF]", verified: true, condition: "Used" },
  { title: "3-Bedroom Apartment, Fully Furnished", price: "SSP 450,000/mo", location: "Juba, Hai Malakal", emoji: "🏘️", bg: "bg-[#DDF2E8]", verified: true, condition: "Long Term" },
  { title: "MacBook Pro M2 16-inch with AppleCare", price: "SSP 2,400,000", location: "Juba, Thongping", emoji: "💻", bg: "bg-[#EDE2FA]", years: "2+ YEARS ON SOUQSS", condition: "Like New" },
  { title: "Solar Panel 450W Mono + Free Installation", price: "SSP 320,000", location: "Greater Juba", emoji: "☀️", bg: "bg-[#FEF3D2]", verified: true, enterprise: true, condition: "Brand New" },
  { title: "Traditional Wedding Dress Custom Tailoring", price: "SSP 85,000", location: "Juba, Konyo Konyo", emoji: "👗", bg: "bg-[#EDE2FA]", condition: "Made to order" },
  { title: "Fresh Yei Mangoes 50kg Crate, Direct from Farm", price: "SSP 28,000", location: "Yei → Juba", emoji: "🥭", bg: "bg-[#FEF3D2]", verified: true, condition: "Fresh" },
  { title: "L-shape Leather Sofa Set 7-seater", price: "SSP 320,000", location: "Juba, Munuki", emoji: "🛋️", bg: "bg-[#FDE8DF]", condition: "Used" },
  { title: "Honda CG 125 Boda Boda, Excellent Condition", price: "SSP 1,800,000", location: "Juba, Jebel", emoji: "🏍️", bg: "bg-[#DCE9FA]", verified: true, condition: "Used" },
];

function HeaderBar() {
  return (
    <header className="bg-brand text-white sticky top-0 z-30">
      <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center gap-6">
        <a href="/" className="text-2xl font-extrabold tracking-tight italic">souq<span className="opacity-90">SS</span></a>
        <div className="hidden md:block flex-1 text-center text-[15px] font-semibold tracking-wide opacity-95">
          SELL FASTER, BUY SMARTER
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a className="hidden sm:inline hover:underline cursor-pointer">Sign in</a>
          <span className="hidden sm:inline opacity-50">|</span>
          <a className="hidden sm:inline hover:underline cursor-pointer">Registration</a>
          <button className="bg-cta hover:opacity-95 transition text-white font-extrabold px-7 py-2.5 rounded-md text-[15px] tracking-wide shadow-sm">
            SELL
          </button>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-brand relative">
      <div className="max-w-[1280px] mx-auto px-4 pt-8 pb-24 text-center">
        <h1 className="text-white text-2xl sm:text-3xl font-semibold mb-6">What are you looking for?</h1>
        <div className="max-w-[680px] mx-auto bg-white rounded-md shadow-lg flex items-stretch overflow-hidden">
          <button className="flex items-center gap-2 px-4 sm:px-5 border-r border-border text-foreground font-medium text-sm whitespace-nowrap hover:bg-muted transition">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            All South Sudan
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <input
            className="flex-1 px-4 py-3.5 text-[15px] outline-none placeholder:text-muted-foreground"
            placeholder="I am looking for..."
          />
          <button className="bg-cta hover:opacity-95 transition px-5 flex items-center justify-center text-white" aria-label="Search">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
      </div>
      {/* Curved bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-background" style={{ clipPath: "ellipse(75% 100% at 50% 100%)" }} />
    </section>
  );
}

function CategoryList() {
  return (
    <aside className="bg-card rounded-lg border border-border overflow-hidden">
      {CATEGORIES.map((c, i) => (
        <a
          key={c.name}
          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted transition ${i !== CATEGORIES.length - 1 ? "border-b border-border" : ""}`}
        >
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-base shrink-0">{c.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold text-foreground leading-tight">{c.name}</div>
            <div className="text-[11.5px] text-muted-foreground mt-0.5">{c.count} ads</div>
          </div>
          <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      ))}
    </aside>
  );
}

function InfoCards() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {INFO_CARDS.map((c) => (
        <a key={c.title} className={`${c.bg} rounded-lg p-4 cursor-pointer hover:opacity-90 transition flex items-end justify-between min-h-[96px] relative overflow-hidden`}>
          <span className="font-semibold text-[14px] text-foreground relative z-10">{c.title}</span>
          <span className="text-4xl absolute top-2 right-3 opacity-90">{c.icon}</span>
        </a>
      ))}
    </div>
  );
}

function AdCard({ ad }: { ad: Ad }) {
  return (
    <article className={`bg-card rounded-lg overflow-hidden border ${ad.enterprise ? "border-brand border-2" : "border-border"} cursor-pointer hover:shadow-md transition relative`}>
      {ad.enterprise && (
        <div className="absolute top-0 left-0 bg-brand text-white text-[9px] font-extrabold px-2 py-0.5 tracking-wider z-10 rounded-br">
          ENTERPRISE
        </div>
      )}
      <div className={`relative aspect-square ${ad.bg} flex items-center justify-center text-6xl`}>
        <span>{ad.emoji}</span>
        {ad.verified && (
          <span className="absolute top-2 right-2 bg-white/95 text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-brand" fill="currentColor"><path d="M12 2l3 6 6 .9-4.5 4.4 1 6.7L12 17l-5.5 3 1-6.7L3 8.9 9 8z"/></svg>
            Verified ID
          </span>
        )}
        {ad.rating && (
          <span className="absolute top-9 right-2 bg-white/95 text-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            {ad.rating} <span className="text-amber-500">★★★★★</span>
          </span>
        )}
        {ad.years && !ad.rating && (
          <span className="absolute bottom-2 left-2 bg-white/95 text-foreground text-[9.5px] font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/></svg>
            {ad.years}
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-price font-extrabold text-[15px] mb-1">{ad.price}</div>
        <div className="text-[13px] font-semibold text-foreground leading-snug mb-2 line-clamp-2 min-h-[34px]">{ad.title}</div>
        <div className="text-[11.5px] text-muted-foreground flex items-center gap-1 mb-2">
          <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span className="truncate">{ad.location}</span>
        </div>
        {ad.condition && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium">{ad.condition}</span>
            <span className="text-base">🔥</span>
          </div>
        )}
      </div>
    </article>
  );
}

function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white/80 mt-16">
      <div className="max-w-[1280px] mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-2xl font-extrabold italic text-white mb-3">souqSS</div>
          <p className="text-white/60 text-[13px]">South Sudan's largest marketplace. Sell faster, buy smarter.</p>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-[13px] uppercase tracking-wide">SouqSS</h4>
          <ul className="space-y-2 text-[13px]"><li>About us</li><li>Help & Contact</li><li>Press</li><li>Careers</li></ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-[13px] uppercase tracking-wide">Support</h4>
          <ul className="space-y-2 text-[13px]"><li>How to sell</li><li>How to buy</li><li>Safety tips</li><li>Terms</li></ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-3 text-[13px] uppercase tracking-wide">Follow us</h4>
          <ul className="space-y-2 text-[13px]"><li>Facebook</li><li>Twitter / X</li><li>Instagram</li><li>YouTube</li></ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[12px] text-white/50">© {new Date().getFullYear()} SouqSS. All rights reserved.</div>
    </footer>
  );
}

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeaderBar />
      <Hero />

      <main className="max-w-[1280px] mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          <CategoryList />

          <div>
            <InfoCards />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[20px] font-extrabold text-foreground">Trending ads</h2>
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded bg-card border border-border flex items-center justify-center text-brand" aria-label="Grid view">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </button>
                <button className="w-8 h-8 rounded bg-card border border-border flex items-center justify-center text-muted-foreground" aria-label="List view">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {ADS.map((ad) => <AdCard key={ad.title} ad={ad} />)}
            </div>

            <div className="text-center mt-8">
              <button className="bg-card border border-border hover:bg-muted text-foreground font-semibold px-8 py-3 rounded-md text-sm transition">
                Show more ads
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
