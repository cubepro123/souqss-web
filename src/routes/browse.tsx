import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import { ListingImage } from "@/components/listing-image";
import { useDataSaver } from "@/hooks/use-data-saver";

type Search = { q?: string; category?: string; city?: string; minPrice?: number; maxPrice?: number };

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    city: typeof s.city === "string" ? s.city : undefined,
    minPrice: s.minPrice !== undefined && !isNaN(Number(s.minPrice)) ? Number(s.minPrice) : undefined,
    maxPrice: s.maxPrice !== undefined && !isNaN(Number(s.maxPrice)) ? Number(s.maxPrice) : undefined,
  }),
  component: Browse,
  head: () => ({
    meta: [
      { title: "Browse Listings — SouqSS" },
      { name: "description", content: "Browse thousands of classifieds in South Sudan. Find phones, cars, property, fashion, jobs and services." },
      { property: "og:title", content: "Browse Listings — SouqSS" },
      { property: "og:description", content: "Browse thousands of classifieds in South Sudan. Find phones, cars, property, fashion, jobs and services." },
      { property: "og:url", content: "/browse" },
      { name: "twitter:title", content: "Browse Listings — SouqSS" },
      { name: "twitter:description", content: "Browse thousands of classifieds in South Sudan. Find phones, cars, property, fashion, jobs and services." },
    ],
    links: [
      { rel: "canonical", href: "/browse" },
    ],
  }),
});

const CATEGORIES = ["Electronics", "Vehicles", "Real Estate", "Fashion", "Home & Furniture", "Services", "Jobs", "Food", "Pets", "Beauty & Care", "Babies & Kids", "Farming", "For Sale"];
const CITIES = ["All cities", "Juba", "Wau", "Malakal", "Yei", "Aweil", "Bor", "Rumbek", "Other"];
const PAGE_SIZE = 24;

type L = { id: string; title: string; price: number | null; currency: string; city: string | null; category: string; condition: string | null; images: string[] };

function Browse() {
  const { q, category, city, minPrice, maxPrice } = Route.useSearch();
  const navigate = useNavigate();
  const [dataSaver, setDataSaver] = useDataSaver();
  const [items, setItems] = useState<L[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(q || "");
  const [minInput, setMinInput] = useState(minPrice?.toString() || "");
  const [maxInput, setMaxInput] = useState(maxPrice?.toString() || "");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setInput(q || "");
    setMinInput(minPrice?.toString() || "");
    setMaxInput(maxPrice?.toString() || "");
    setPage(0);
  }, [q, category, city, minPrice, maxPrice]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      let query = supabase.from("listings")
        .select("id,title,price,currency,city,category,condition,images")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
      if (category) query = query.eq("category", category);
      if (city && city !== "All cities") query = query.eq("city", city);
      if (q) query = query.ilike("title", `%${q}%`);
      if (minPrice !== undefined) query = query.gte("price", minPrice);
      if (maxPrice !== undefined) query = query.lte("price", maxPrice);
      const { data } = await query;
      const rows = (data || []) as L[];
      setItems((prev) => page === 0 ? rows : [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
    })();
  }, [q, category, city, minPrice, maxPrice, page]);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { q: input || undefined, category, city, minPrice, maxPrice } });
  };

  const applyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minInput ? Number(minInput) : undefined;
    const max = maxInput ? Number(maxInput) : undefined;
    navigate({ to: "/browse", search: { q, category, city, minPrice: min, maxPrice: max } });
  };

  const clearAll = () => {
    navigate({ to: "/browse", search: {} });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 h-16 flex items-center gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="hidden sm:inline text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <form onSubmit={applySearch} className="flex-1 max-w-[600px] flex gap-2 min-w-0">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search listings…" className="flex-1 min-w-0 px-3 sm:px-4 py-2 min-h-[40px] rounded-xl border-2 border-border focus:border-brand outline-none text-[16px] sm:text-[14px] bg-background" />
            <button aria-label="Search" className="bg-brand hover:bg-brand-dark text-white font-bold px-4 sm:px-5 min-h-[40px] rounded-xl text-[13px] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
          <Link to="/post-ad" className="hidden sm:inline bg-foreground text-white font-bold px-4 py-2 rounded-xl text-[13px]">+ Post</Link>
          <button
            type="button"
            onClick={() => setDataSaver(!dataSaver)}
            title={dataSaver ? "Data saver is ON — images hidden" : "Turn on Data saver"}
            aria-pressed={dataSaver}
            className={`shrink-0 inline-flex items-center gap-1 min-h-[36px] px-2.5 rounded-xl text-[11.5px] font-extrabold border transition ${dataSaver ? "bg-brand text-white border-brand" : "bg-card text-muted-foreground border-border hover:text-foreground"}`}
          >
            <span aria-hidden>{dataSaver ? "📵" : "📶"}</span>
            <span className="hidden sm:inline">Data saver{dataSaver ? " ON" : ""}</span>
          </button>
        </div>
        {dataSaver && (
          <div className="bg-brand-soft text-brand-dark text-[11.5px] font-bold text-center py-1 border-t border-border">
            Data saver on — listing photos hidden to save bandwidth
          </div>
        )}
      </header>

      <main className="max-w-[1280px] mx-auto px-3 sm:px-4 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 sm:gap-5">
        {/* Mobile filter toggle */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="lg:hidden flex items-center justify-between w-full bg-card border border-border rounded-xl px-4 min-h-[44px] text-[13.5px] font-bold"
          aria-expanded={filtersOpen}
        >
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/></svg>
            Filters
            {(category || (city && city !== "All cities") || minPrice !== undefined || maxPrice !== undefined) && (
              <span className="bg-brand text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">ON</span>
            )}
          </span>
          <span className="text-muted-foreground text-[18px] leading-none">{filtersOpen ? "−" : "+"}</span>
        </button>
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block space-y-4 lg:sticky lg:top-[72px] lg:self-start lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto`}>
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider mb-2">City</div>
            <select value={city || "All cities"} onChange={(e) => navigate({ to: "/browse", search: { q, category, city: e.target.value === "All cities" ? undefined : e.target.value, minPrice, maxPrice } })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-[13.5px]">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <form onSubmit={applyPrice} className="bg-card rounded-2xl border border-border p-4 space-y-2">
            <div className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Price range (SSP)</div>
            <div className="flex gap-2">
              <input type="number" min="0" inputMode="numeric" value={minInput} onChange={(e) => setMinInput(e.target.value)} placeholder="Min" className="w-1/2 px-2.5 py-2 rounded-lg border border-border bg-background text-[13px] outline-none focus:border-brand" />
              <input type="number" min="0" inputMode="numeric" value={maxInput} onChange={(e) => setMaxInput(e.target.value)} placeholder="Max" className="w-1/2 px-2.5 py-2 rounded-lg border border-border bg-background text-[13px] outline-none focus:border-brand" />
            </div>
            <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2 rounded-lg text-[12.5px]">Apply price</button>
            {(minPrice !== undefined || maxPrice !== undefined || q || category || (city && city !== "All cities")) && (
              <button type="button" onClick={clearAll} className="w-full text-muted-foreground hover:text-foreground font-semibold py-1 text-[12px] underline">Clear all filters</button>
            )}
          </form>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider">Categories</div>
            <button onClick={() => navigate({ to: "/browse", search: { q, city, minPrice, maxPrice } })} className={`w-full text-left px-4 py-2 text-[13.5px] font-semibold hover:bg-brand-soft transition ${!category ? "bg-brand-soft text-brand-dark" : ""}`}>All categories</button>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => navigate({ to: "/browse", search: { q, category: c, city, minPrice, maxPrice } })} className={`w-full text-left px-4 py-2 text-[13.5px] font-semibold border-t border-border hover:bg-brand-soft transition ${category === c ? "bg-brand-soft text-brand-dark" : ""}`}>{c}</button>
            ))}
          </div>
        </aside>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[20px] font-extrabold">
              {category || "All listings"}
              {q && <span className="text-muted-foreground font-semibold"> · "{q}"</span>}
            </h1>
            <div className="text-[12.5px] text-muted-foreground">{items.length} result{items.length !== 1 ? "s" : ""}</div>
          </div>

          {items.length === 0 && !loading ? (
            <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-[14px] text-muted-foreground">No ads match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {items.map((l) => (
                <Link key={l.id} to="/listings/$id" params={{ id: l.id }} className="group bg-card rounded-2xl overflow-hidden border border-border hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.12)] transition">
                  <div className="aspect-square bg-muted overflow-hidden">
                    <ListingImage src={l.images?.[0]} alt={l.title} />
                  </div>
                  <div className="p-3">
                    <div className="text-price font-extrabold text-[15px] mb-1">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                    <div className="text-[13px] font-semibold leading-snug line-clamp-2 min-h-[34px]">{l.title}</div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <span className="text-[11.5px] text-muted-foreground truncate">{l.city || l.category}</span>
                      {l.condition && <span className="text-[10.5px] bg-brand-soft text-brand-dark px-2 py-0.5 rounded font-bold shrink-0">{l.condition}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasMore && items.length > 0 && (
            <div className="text-center mt-8">
              <button disabled={loading} onClick={() => setPage((p) => p + 1)} className="bg-card border-2 border-border hover:border-brand hover:text-brand disabled:opacity-50 font-bold px-8 py-3 rounded-xl text-[14px] transition">
                {loading ? "Loading…" : "Load more →"}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
