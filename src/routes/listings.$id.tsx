import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetail,
  head: () => ({ meta: [{ title: "Listing — SouqSS" }] }),
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
        const { data: p } = await supabase.from("profiles").select("display_name,phone,city").eq("id", data.user_id).maybeSingle();
        setSeller(p);
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <Link to="/browse" className="ml-auto text-[13px] font-semibold text-muted-foreground hover:text-foreground">← Back to browse</Link>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading…</div>
        ) : !l ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <h1 className="text-[22px] font-extrabold mb-2">Listing not found</h1>
            <Link to="/" className="text-brand font-bold">← Back to home</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div>
              <div className="bg-card rounded-3xl overflow-hidden border border-border">
                <div className="aspect-[4/3] bg-muted">
                  {l.images?.[active] ? (
                    <img src={l.images[active]} alt={l.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">📦</div>
                  )}
                </div>
                {l.images && l.images.length > 1 && (
                  <div className="p-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-border">
                    {l.images.map((src, i) => (
                      <button key={i} onClick={() => setActive(i)} className={`w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition ${i === active ? "border-brand" : "border-transparent"}`}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-card rounded-3xl border border-border p-6 mt-4">
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
              <div className="bg-card rounded-3xl border border-border p-6">
                <div className="text-price text-[26px] font-extrabold tracking-tight">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                <h1 className="text-[18px] font-extrabold mt-1 leading-snug">{l.title}</h1>
                <div className="text-[12.5px] text-muted-foreground mt-1">{l.city}</div>

                <button onClick={toggleFav} className={`w-full mt-4 py-2.5 rounded-xl font-bold text-[13.5px] border-2 transition ${fav ? "bg-brand-soft border-brand text-brand-dark" : "border-border hover:border-brand"}`}>
                  {fav ? "♥ Saved" : "♡ Save ad"}
                </button>

                {user?.id === l.user_id && (
                  <button onClick={remove} className="w-full mt-2 py-2.5 rounded-xl font-bold text-[13px] text-destructive border-2 border-destructive/30 hover:bg-destructive/5 transition">
                    Delete my ad
                  </button>
                )}
              </div>

              <div className="bg-card rounded-3xl border border-border p-6">
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

                {seller?.phone ? (
                  <>
                    <button onClick={() => setShowPhone(true)} className="w-full mt-4 bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-xl text-[14px] transition">
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
    </div>
  );
}
