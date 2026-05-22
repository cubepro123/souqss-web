import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/shops")({
  component: ShopsPage,
  head: () => ({ meta: [
    { title: "Shops & Service providers — SouqSS" },
    { name: "description", content: "Browse online shops and service providers on SouqSS." },
  ] }),
});

type Shop = {
  id: string; name: string; description: string | null;
  shop_type: string; service_category: string | null;
  city: string | null; logo_url: string | null;
};

function ShopsPage() {
  const [type, setType] = useState<"all" | "seller" | "service_provider">("all");
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let q = supabase.from("shops").select("id,name,description,shop_type,service_category,city,logo_url").order("created_at", { ascending: false });
    if (type !== "all") q = q.eq("shop_type", type);
    q.then(({ data }) => { setShops(data || []); setLoading(false); });
  }, [type]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <Link to="/my-shop" className="ml-auto bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-[13px]">+ Open a shop</Link>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <h1 className="text-[26px] font-extrabold mb-1">Shops & Service providers</h1>
        <p className="text-[13.5px] text-muted-foreground mb-5">Discover local sellers and service providers.</p>

        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            ["all", "All"], ["seller", "🏪 Sellers"], ["service_provider", "🛠️ Service providers"],
          ] as const).map(([k, l]) => (
            <button key={k} onClick={() => setType(k)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold border-2 transition ${type === k ? "bg-brand text-white border-brand" : "border-border hover:border-brand"}`}>
              {l}
            </button>
          ))}
        </div>

        {loading ? <div className="text-muted-foreground text-[14px]">Loading…</div> :
          shops.length === 0 ? (
            <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 text-center">
              <div className="text-4xl mb-2">🏬</div>
              <p className="text-[14px] text-muted-foreground">No shops yet. Be the first to open one!</p>
              <Link to="/my-shop" className="inline-block mt-3 bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-[13px]">Open a shop</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shops.map((s) => (
                <Link key={s.id} to="/shops/$id" params={{ id: s.id }} className="bg-card border border-border hover:border-brand rounded-2xl p-4 transition flex gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {s.logo_url ? <img src={s.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">{s.shop_type === "service_provider" ? "🛠️" : "🏪"}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-[15px] truncate">{s.name}</div>
                    <div className="text-[11.5px] uppercase tracking-wide text-brand font-bold mt-0.5">
                      {s.shop_type === "service_provider" ? `Service · ${s.service_category || "—"}` : "Seller"}
                    </div>
                    {s.city && <div className="text-[12px] text-muted-foreground mt-0.5">📍 {s.city}</div>}
                    {s.description && <p className="text-[12.5px] text-muted-foreground mt-1 line-clamp-2">{s.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
