import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/favorites")({
  component: Favorites,
  head: () => ({ meta: [{ title: "Saved ads — SouqSS" }] }),
});

type Row = { listing_id: string; listings: { id: string; title: string; price: number | null; currency: string; city: string | null; category: string; images: string[] } | null };

const PAGE_SIZE = 24;

function Favorites() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase.from("favorites")
      .select("listing_id, listings(id,title,price,currency,city,category,images)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)
      .then(({ data }) => {
        const next = (data as any) || [];
        setRows((prev) => page === 0 ? next : [...prev, ...next]);
        setHasMore(next.length === PAGE_SIZE);
        setLoading(false);
      });
  }, [user, page]);

  const remove = async (listingId: string) => {
    if (!user) return;
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
    setRows((r) => r.filter((x) => x.listing_id !== listingId));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <Link to="/profile" className="ml-auto text-[13px] font-semibold text-muted-foreground hover:text-foreground">My account</Link>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <h1 className="text-[24px] font-extrabold mb-1">♥ Saved ads</h1>
        <p className="text-[13px] text-muted-foreground mb-6">Ads you've saved for later.</p>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center">
            <div className="text-4xl mb-2">💝</div>
            <p className="text-[14px] text-muted-foreground mb-3">You haven't saved any ads yet.</p>
            <Link to="/browse" className="text-brand font-bold">Browse listings →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {rows.filter((r) => r.listings).map((r) => {
              const l = r.listings!;
              return (
                <div key={r.listing_id} className="group bg-card rounded-2xl overflow-hidden border border-border relative">
                  <Link to="/listings/$id" params={{ id: l.id }}>
                    <div className="aspect-square bg-muted">
                      {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
                    </div>
                    <div className="p-3">
                      <div className="text-price font-extrabold text-[15px]">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                      <div className="text-[13px] font-semibold line-clamp-2 min-h-[34px] mt-1">{l.title}</div>
                      <div className="text-[11.5px] text-muted-foreground mt-1">{l.city || l.category}</div>
                    </div>
                  </Link>
                  <button onClick={() => remove(r.listing_id)} className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-brand hover:bg-brand-soft transition" aria-label="Remove">♥</button>
                </div>
              );
            })}
          </div>
        )}
        {hasMore && rows.length > 0 && (
          <div className="text-center mt-8">
            <button disabled={loading} onClick={() => setPage((p) => p + 1)} className="bg-card border-2 border-border hover:border-brand hover:text-brand disabled:opacity-50 font-bold px-8 py-3 rounded-xl text-[14px] transition">
              {loading ? "Loading…" : "Load more →"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
