import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/my-shop")({
  component: MyShopPage,
  head: () => ({ meta: [{ title: "My shop — SouqSS" }] }),
});

const SERVICE_CATEGORIES = [
  "Plumbing", "Electrical", "Cleaning", "Construction", "Tutoring",
  "Photography", "Catering", "Transport / Delivery", "IT / Web", "Beauty / Salon",
  "Tailoring", "Mechanic / Auto repair", "Event planning", "Legal", "Health / Medical",
  "Other",
];

type Shop = {
  id?: string;
  name: string;
  description: string;
  shop_type: "seller" | "service_provider";
  service_category: string;
  city: string;
  phone: string;
  logo_url: string;
};

const EMPTY: Shop = {
  name: "", description: "", shop_type: "seller",
  service_category: "", city: "", phone: "", logo_url: "",
};

function MyShopPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop>(EMPTY);
  const [existing, setExisting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("shops").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setShop({
            id: data.id,
            name: data.name || "",
            description: data.description || "",
            shop_type: (data.shop_type as any) || "seller",
            service_category: data.service_category || "",
            city: data.city || "",
            phone: data.phone || "",
            logo_url: data.logo_url || "",
          });
          setExisting(true);
        }
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (!shop.name.trim()) { setMsg("Shop name is required"); return; }
    if (shop.shop_type === "service_provider" && !shop.service_category) {
      setMsg("Pick the service you provide"); return;
    }
    setBusy(true); setMsg(null);
    const payload = {
      user_id: user.id,
      name: shop.name.slice(0, 80),
      description: shop.description.slice(0, 1000) || null,
      shop_type: shop.shop_type,
      service_category: shop.shop_type === "service_provider" ? shop.service_category : null,
      city: shop.city.slice(0, 60) || null,
      phone: shop.phone.slice(0, 30) || null,
      logo_url: shop.logo_url || null,
    };
    const { error, data } = existing
      ? await supabase.from("shops").update(payload).eq("user_id", user.id).select().single()
      : await supabase.from("shops").insert(payload).select().single();
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    setExisting(true);
    setMsg("Saved ✓");
    if (data) navigate({ to: "/shops/$id", params: { id: data.id } });
  };

  const remove = async () => {
    if (!user || !existing) return;
    if (!confirm("Close your shop?")) return;
    await supabase.from("shops").delete().eq("user_id", user.id);
    setShop(EMPTY); setExisting(false); setMsg("Shop closed");
  };

  const uploadLogo = async (f: File) => {
    if (!user) return;
    setBusy(true);
    const path = `${user.id}/shop-logo-${Date.now()}-${f.name}`;
    const { error } = await supabase.storage.from("listing-images").upload(path, f, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("listing-images").getPublicUrl(path);
      setShop((s) => ({ ...s, logo_url: publicUrl }));
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[900px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <Link to="/shops" className="ml-auto text-[13px] font-bold text-muted-foreground hover:text-foreground">All shops</Link>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-8">
        <h1 className="text-[24px] font-extrabold mb-1">{existing ? "Manage your shop" : "Open a shop"}</h1>
        <p className="text-[13px] text-muted-foreground mb-6">Each account can have one shop. Show what you sell or which service you provide.</p>

        <section className="bg-card rounded-3xl border border-border p-6 space-y-5">
          <div>
            <label className="text-[12px] font-bold block mb-2">Shop type</label>
            <div className="grid grid-cols-2 gap-3">
              {(["seller", "service_provider"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setShop({ ...shop, shop_type: t })}
                  className={`text-left p-4 rounded-2xl border-2 transition ${shop.shop_type === t ? "border-brand bg-brand/5" : "border-border hover:border-muted-foreground/40"}`}>
                  <div className="text-[15px] font-extrabold">{t === "seller" ? "🏪 Seller" : "🛠️ Service provider"}</div>
                  <div className="text-[12.5px] text-muted-foreground mt-1">
                    {t === "seller" ? "You sell physical products or goods." : "You offer a service (plumbing, tutoring, transport…)."}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {shop.shop_type === "service_provider" && (
            <div>
              <label className="text-[12px] font-bold block mb-1.5">Which service do you provide?</label>
              <select value={shop.service_category} onChange={(e) => setShop({ ...shop, service_category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                <option value="">— pick a service —</option>
                {SERVICE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold block mb-1.5">Shop name *</label>
              <input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} maxLength={80}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div>
              <label className="text-[12px] font-bold block mb-1.5">City</label>
              <input value={shop.city} onChange={(e) => setShop({ ...shop, city: e.target.value })} maxLength={60} placeholder="e.g. Juba"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[12px] font-bold block mb-1.5">Contact phone</label>
              <input value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })} maxLength={30} placeholder="+211 …"
                className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold block mb-1.5">Description</label>
            <textarea value={shop.description} onChange={(e) => setShop({ ...shop, description: e.target.value })} maxLength={1000} rows={5}
              placeholder={shop.shop_type === "seller" ? "What you sell, opening hours, delivery, etc." : "Describe your service, experience, pricing, areas covered, etc."}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background resize-y" />
          </div>

          <div>
            <label className="text-[12px] font-bold block mb-1.5">Logo (optional)</label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden flex items-center justify-center">
                {shop.logo_url ? <img src={shop.logo_url} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">🏬</span>}
              </div>
              <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} className="text-[12px]" />
            </div>
          </div>

          {msg && <div className="text-[13px] text-brand-dark font-semibold">{msg}</div>}

          <div className="flex flex-wrap gap-2 pt-2">
            <button disabled={busy} onClick={save} className="bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-[14px]">
              {busy ? "Saving…" : existing ? "Save changes" : "Open my shop"}
            </button>
            {existing && (
              <button disabled={busy} onClick={remove} className="border-2 border-border hover:border-brand font-bold px-5 py-2.5 rounded-xl text-[14px]">
                Close shop
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
