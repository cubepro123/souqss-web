import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";
import { ListingImage } from "@/components/listing-image";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetail,
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("listings")
      .select("title,description,images,price,currency,city")
      .eq("id", params.id)
      .maybeSingle();
    return { meta: data };
  },
  head: ({ loaderData, params }) => {
    const m = loaderData?.meta;
    const title = m ? `${m.title} — SouqSS` : "Listing — SouqSS";
    const desc = m?.description?.slice(0, 160) || `Listing on SouqSS${m?.city ? ` in ${m.city}` : ""}.`;
    const img = m?.images?.[0];
    const url = `/listings/${params.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "product" },
        ...(img ? [{ property: "og:image", content: img }] : []),
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...(img ? [{ name: "twitter:image", content: img }] : []),
      ],
      links: [
        { rel: "canonical", href: url },
      ],
    };
  },
});

type Listing = {
  id: string; user_id: string; title: string; description: string | null;
  price: number | null; currency: string; category: string; condition: string | null;
  city: string | null; images: string[]; created_at: string; status: string;
};
type Seller = { display_name: string | null; phone: string | null; city: string | null };

function ListingDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [l, setL] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [active, setActive] = useState(0);
  const [fav, setFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (data) {
        setL(data as Listing);
        const cols = user ? "display_name,phone,city" : "display_name,city";
        const { data: p } = await supabase.from("profiles").select(cols).eq("id", data.user_id).maybeSingle();
        setSeller(p as any);
      }
      if (user) {
        const { data: f } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("listing_id", id).maybeSingle();
        setFav(!!f);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const toggleFav = async () => {
    if (!user) { navigate({ to: "/auth" }); return; }
    if (fav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", id);
      setFav(false);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, listing_id: id });
      setFav(true);
    }
  };

  const remove = async () => {
    if (!l || !user || user.id !== l.user_id) return;
    if (!confirm("Delete this ad?")) return;
    await supabase.from("listings").delete().eq("id", l.id);
    navigate({ to: "/profile" });
  };

  const messageSeller = async () => {
    if (!l) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (user.id === l.user_id) return;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", l.id)
      .eq("buyer_id", user.id)
      .maybeSingle();
    if (existing) { navigate({ to: "/inbox/$id", params: { id: existing.id } }); return; }
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ listing_id: l.id, buyer_id: user.id, seller_id: l.user_id })
      .select("id")
      .single();
    if (!error && created) navigate({ to: "/inbox/$id", params: { id: created.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-3 sm:px-4 h-16 flex items-center gap-3 sm:gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="hidden sm:inline text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <Link to="/browse" className="ml-auto text-[13px] font-semibold text-muted-foreground hover:text-foreground min-h-[44px] flex items-center">← <span className="hidden sm:inline ml-1">Back to browse</span><span className="sm:hidden ml-1">Browse</span></Link>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : !l ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <h1 className="text-[22px] font-extrabold mb-2">Listing not found</h1>
            <Link to="/" className="text-brand font-bold">← Back to home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-6">
            <div>
              {/* Mobile price + title above the fold */}
              <div className="lg:hidden mb-3">
                <div className="text-price text-[26px] font-extrabold tracking-tight leading-none">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                <h1 className="text-[18px] font-extrabold mt-1.5 leading-snug">{l.title}</h1>
                <div className="text-[12.5px] text-muted-foreground mt-1 flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {l.city || "South Sudan"}
                </div>
              </div>
              <div className="bg-card rounded-2xl sm:rounded-3xl overflow-hidden border border-border">
                <div className="aspect-[4/3] bg-muted">
                  <ListingImage src={l.images?.[active]} alt={l.title} fit="contain" />
                </div>
                {l.images && l.images.length > 1 && (
                  <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-border">
                    {l.images.map((src, i) => (
                      <button key={i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`} className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 border-2 transition ${i === active ? "border-brand" : "border-transparent"}`}>
                        <ListingImage src={src} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 mt-4">
                <h2 className="text-[16px] font-extrabold mb-3">Description</h2>
                <p className="text-[14px] text-foreground/80 whitespace-pre-wrap leading-relaxed">{l.description || "No description provided."}</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border text-[13px]">
                  <div><div className="text-muted-foreground text-[11.5px] font-semibold mb-0.5">Category</div><div className="font-bold">{l.category}</div></div>
                  <div><div className="text-muted-foreground text-[11.5px] font-semibold mb-0.5">Condition</div><div className="font-bold">{l.condition || "—"}</div></div>
                  <div><div className="text-muted-foreground text-[11.5px] font-semibold mb-0.5">City</div><div className="font-bold">{l.city || "—"}</div></div>
                  <div><div className="text-muted-foreground text-[11.5px] font-semibold mb-0.5">Posted</div><div className="font-bold">{new Date(l.created_at).toLocaleDateString()}</div></div>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="hidden lg:block bg-card rounded-3xl border border-border p-6">
                <div className="text-price text-[26px] font-extrabold tracking-tight">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                <h1 className="text-[18px] font-extrabold mt-1 leading-snug">{l.title}</h1>
                <div className="text-[12.5px] text-muted-foreground mt-1">{l.city}</div>

                <button onClick={toggleFav} className={`w-full mt-4 py-2.5 rounded-xl font-bold text-[13.5px] border-2 transition ${fav ? "bg-brand-soft border-brand text-brand-dark" : "border-border hover:border-brand"}`}>
                  {fav ? "♥ Saved" : "♡ Save ad"}
                </button>

                {user?.id === l.user_id && (
                  <>
                    <Link to="/edit-listing/$id" params={{ id: l.id }} className="block text-center w-full mt-2 py-2.5 rounded-xl font-bold text-[13px] text-brand border-2 border-brand/30 hover:bg-brand-soft transition">
                      Edit my ad
                    </Link>
                    <button onClick={remove} className="w-full mt-2 py-2.5 rounded-xl font-bold text-[13px] text-destructive border-2 border-destructive/30 hover:bg-destructive/5 transition">
                      Delete my ad
                    </button>
                  </>
                )}
              </div>

              {/* Mobile owner-action mini block (Save / Edit / Delete) */}
              <div className="lg:hidden bg-card rounded-2xl border border-border p-4 flex gap-2">
                <button onClick={toggleFav} aria-label={fav ? "Saved" : "Save ad"} className={`flex-1 py-2.5 min-h-[44px] rounded-xl font-bold text-[13px] border-2 transition ${fav ? "bg-brand-soft border-brand text-brand-dark" : "border-border hover:border-brand"}`}>
                  {fav ? "♥ Saved" : "♡ Save"}
                </button>
                {user?.id === l.user_id && (
                  <>
                    <Link to="/edit-listing/$id" params={{ id: l.id }} className="flex-1 text-center py-2.5 min-h-[44px] rounded-xl font-bold text-[13px] text-brand border-2 border-brand/30 flex items-center justify-center">
                      Edit
                    </Link>
                    <button onClick={remove} aria-label="Delete ad" className="py-2.5 px-4 min-h-[44px] rounded-xl font-bold text-[13px] text-destructive border-2 border-destructive/30">
                      ✕
                    </button>
                  </>
                )}
              </div>

              <div className="bg-card rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6">
                <div className="text-[11.5px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Seller</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center font-extrabold text-brand-dark">
                    {(seller?.display_name || "S").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[14px]">{seller?.display_name || "SouqSS seller"}</div>
                    <div className="text-[12px] text-muted-foreground">{seller?.city || l.city || "South Sudan"}</div>
                  </div>
                </div>

                {user?.id !== l.user_id && (
                  <button onClick={messageSeller} className="w-full mt-4 bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl text-[14px] transition">
                    💬 Message seller
                  </button>
                )}

                {seller?.phone ? (
                  <>
                    <button onClick={() => setShowPhone(true)} className={`w-full ${user?.id !== l.user_id ? "mt-2 border-2 border-brand text-brand-dark hover:bg-brand-soft" : "mt-4 bg-brand hover:bg-brand-dark text-white"} font-bold py-3 rounded-xl text-[14px] transition`}>
                      {showPhone ? `📞 ${seller.phone}` : "Show phone number"}
                    </button>
                    {showPhone && (
                      <a href={`https://wa.me/${seller.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="block text-center mt-2 bg-[#25D366] hover:opacity-90 text-white font-bold py-3 rounded-xl text-[14px] transition">
                        💬 Chat on WhatsApp
                      </a>
                    )}
                  </>
                ) : (
                  <div className="mt-4 text-[12.5px] text-muted-foreground bg-muted rounded-lg p-3 text-center">Seller hasn't added a phone number.</div>
                )}
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Mobile sticky bottom CTA bar */}
      {!loading && l && user?.id !== l.user_id && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center gap-2 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.18)]">
          <button onClick={toggleFav} aria-label={fav ? "Saved" : "Save"} className={`min-h-[44px] min-w-[44px] rounded-xl border-2 px-3 font-bold text-[14px] ${fav ? "bg-brand-soft border-brand text-brand-dark" : "border-border"}`}>
            {fav ? "♥" : "♡"}
          </button>
          {seller?.phone ? (
            <button onClick={() => setShowPhone(true)} className="flex-1 min-h-[48px] bg-brand hover:bg-brand-dark text-white font-bold rounded-xl text-[14px]">
              {showPhone ? `📞 ${seller.phone}` : "Show phone"}
            </button>
          ) : (
            <button onClick={messageSeller} className="flex-1 min-h-[48px] bg-brand hover:bg-brand-dark text-white font-bold rounded-xl text-[14px]">
              💬 Message seller
            </button>
          )}
          {seller?.phone && (
            <button onClick={messageSeller} aria-label="Message seller" className="min-h-[48px] px-4 bg-foreground text-white font-bold rounded-xl text-[14px]">
              💬
            </button>
          )}
        </div>
      )}
    </div>
  );
}
