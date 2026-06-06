import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

type Search = { q?: string; category?: string; city?: string };

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    city: typeof s.city === "string" ? s.city : undefined,
  }),
  component: Browse,
  head: () => ({ meta: [{ title: "Browse — SouqSS" }] }),
});

const CATEGORIES = ["Electronics", "Vehicles", "Real Estate", "Fashion", "Home & Furniture", "Services", "Jobs", "Food", "Pets", "Beauty & Care", "Babies & Kids", "Farming", "For Sale"];
const CITIES = ["All cities", "Juba", "Wau", "Malakal", "Yei", "Aweil", "Bor", "Rumbek", "Other"];
const PAGE_SIZE = 24;

type L = { id: string; title: string; price: number | null; currency: string; city: string | null; category: string; condition: string | null; images: string[] };

function Browse() {
  const { q, category, city } = Route.useSearch();
  const navigate = useNavigate();
  const [items, setItems] = useState<L[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState(q || "");

  useEffect(() => { setInput(q || ""); setPage(0); }, [q, category, city]);

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
      const { data } = await query;
      const rows = (data || []) as L[];
      setItems((prev) => page === 0 ? rows : [...prev, ...rows]);
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
    })();
  }, [q, category, city, page]);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { q: input || undefined, category, city } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <form onSubmit={applySearch} className="flex-1 max-w-[600px] flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Search listings…" className="flex-1 px-4 py-2 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            <button className="bg-brand hover:bg-brand-dark text-white font-bold px-5 rounded-xl text-[13px]">Search</button>
          </form>
          <Link to="/post-ad" className="hidden sm:inline bg-foreground text-white font-bold px-4 py-2 rounded-xl text-[13px]">+ Post</Link>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
        <aside className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider mb-2">City</div>
            <select value={city || "All cities"} onChange={(e) => navigate({ to: "/browse", search: { q, category, city: e.target.value === "All cities" ? undefined : e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-[13.5px]">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider">Categories</div>
            <button onClick={() => navigate({ to: "/browse", search: { q, city } })} className={`w-full text-left px-4 py-2 text-[13.5px] font-semibold hover:bg-brand-soft transition ${!category ? "bg-brand-soft text-brand-dark" : ""}`}>All categories</button>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => navigate({ to: "/browse", search: { q, category: c, city } })} className={`w-full text-left px-4 py-2 text-[13.5px] font-semibold border-t border-border hover:bg-brand-soft transition ${category === c ? "bg-brand-soft text-brand-dark" : ""}`}>{c}</button>
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
                    {l.images?.[0] ? <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
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
