import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/shops/$id")({
  component: ShopDetailPage,
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("shops")
      .select("name,description,logo_url,city,shop_type,service_category")
      .eq("id", params.id)
      .maybeSingle();
    return { meta: data };
  },
  head: ({ loaderData, params }) => {
    const m = loaderData?.meta;
    const title = m ? `${m.name} — SouqSS` : "Shop — SouqSS";
    const desc = m?.description?.slice(0, 160) || (m?.shop_type === "service_provider" ? `${m?.service_category || "Service"} provider on SouqSS.` : "Shop on SouqSS.");
    const url = `https://id-preview--fe57f89b-b050-4a85-9fd1-816a3abb1d39.lovable.app/shops/${params.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        ...(m?.logo_url ? [{ property: "og:image", content: m.logo_url }] : []),
      ],
    };
  },
});

type Shop = {
  id: string; user_id: string; name: string; description: string | null;
  shop_type: string; service_category: string | null;
  city: string | null; phone: string | null; logo_url: string | null;
};
type Listing = { id: string; title: string; price: number | null; currency: string; images: string[] };

function ShopDetailPage() {
  const { id } = Route.useParams();
  const [shop, setShop] = useState<Shop | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    supabase.from("shops").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setShop(data as Shop | null);
      if (data) {
        const { data: ls } = await supabase.from("listings")
          .select("id,title,price,currency,images")
          .eq("user_id", data.user_id).eq("status", "active")
          .order("created_at", { ascending: false }).limit(200);
        setListings(ls || []);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!shop) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="text-5xl">🏚️</div>
      <p className="font-bold">Shop not found</p>
      <Link to="/shops" className="text-brand font-semibold">← Back to all shops</Link>
    </div>
  );

  const isService = shop.shop_type === "service_provider";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[1000px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <Link to="/shops" className="ml-auto text-[13px] font-bold text-muted-foreground hover:text-foreground">All shops</Link>
        </div>
      </header>

      <main className="max-w-[1000px] mx-auto px-4 py-8 space-y-6">
        <section className="bg-card border border-border rounded-3xl p-6 flex gap-5 flex-col sm:flex-row">
          <div className="w-24 h-24 rounded-3xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
            {shop.logo_url ? <img src={shop.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">{isService ? "🛠️" : "🏪"}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11.5px] uppercase tracking-wide text-brand font-extrabold">
              {isService ? `Service provider · ${shop.service_category || "—"}` : "Seller"}
            </div>
            <h1 className="text-[26px] font-extrabold leading-tight">{shop.name}</h1>
            {shop.city && <div className="text-[13px] text-muted-foreground mt-1">📍 {shop.city}</div>}
            {shop.description && <p className="text-[14px] mt-3 whitespace-pre-wrap">{shop.description}</p>}

            {shop.phone && (
              <div className="mt-4 flex gap-2 flex-wrap">
                {!showPhone ? (
                  <button onClick={() => setShowPhone(true)} className="bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-[13px]">📞 Show phone</button>
                ) : (
                  <a href={`tel:${shop.phone}`} className="bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-[13px]">📞 {shop.phone}</a>
                )}
                {shop.phone && <a href={`https://wa.me/${shop.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="border-2 border-border hover:border-brand font-bold px-4 py-2 rounded-xl text-[13px]">💬 WhatsApp</a>}
              </div>
            )}
          </div>
        </section>

        {!isService && (
          <section>
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <h2 className="text-[18px] font-extrabold">Items from this shop ({listings.length})</h2>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in this shop…"
                className="px-3 py-2 rounded-xl border-2 border-border focus:border-brand outline-none text-[13px] bg-background w-full sm:w-64"
              />
            </div>
            {(() => {
              const filtered = query
                ? listings.filter((l) => l.title.toLowerCase().includes(query.toLowerCase()))
                : listings;
              if (filtered.length === 0) return (
                <div className="text-[13.5px] text-muted-foreground bg-card border border-dashed border-border rounded-2xl p-8 text-center">
                  {query ? "No items match your search." : "No items yet."}
                </div>
              );
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filtered.map((l) => (
                    <Link key={l.id} to="/listings/$id" params={{ id: l.id }} className="bg-card border border-border hover:border-brand rounded-2xl overflow-hidden transition">
                      <div className="aspect-square bg-muted">
                        {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>}
                      </div>
                      <div className="p-2.5">
                        <div className="font-bold text-[13px] line-clamp-2">{l.title}</div>
                        <div className="text-price font-extrabold text-[13px] mt-1">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              );
            })()}
          </section>
        )}
      </main>
    </div>
  );
}
