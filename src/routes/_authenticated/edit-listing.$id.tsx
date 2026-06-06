import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/edit-listing/$id")({
  component: EditListing,
  head: () => ({ meta: [{ title: "Edit ad — SouqSS" }] }),
});

const CATEGORIES = ["Electronics", "Vehicles", "Real Estate", "Fashion", "Home & Furniture", "Services", "Jobs", "Food", "Pets", "Beauty & Care", "Babies & Kids", "Farming", "For Sale"];
const CONDITIONS = ["Brand New", "Like New", "Used", "For Parts"];
const CITIES = ["Juba", "Wau", "Malakal", "Yei", "Aweil", "Bor", "Rumbek", "Other"];

const schema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(2000),
  price: z.number().min(0).max(999999999),
  currency: z.enum(["SSP", "USD"]),
  category: z.string().min(1),
  condition: z.string().min(1),
  city: z.string().min(1),
});

type L = {
  id: string; user_id: string; title: string; description: string | null;
  price: number | null; currency: string; category: string; condition: string | null;
  city: string | null; images: string[]; status: string;
};

function EditListing() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [l, setL] = useState<L | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
      if (data) {
        setL(data as L);
        setImages(data.images || []);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!l) return <div className="min-h-screen flex items-center justify-center"><p className="font-bold">Listing not found</p></div>;
  if (user && l.user_id !== user.id) return <div className="min-h-screen flex items-center justify-center"><p className="font-bold">You can only edit your own ads.</p></div>;

  const uploadImages = async (files: FileList | null) => {
    if (!files || !user) return;
    setBusy(true);
    const next = [...images];
    for (const file of Array.from(files).slice(0, 6 - next.length)) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("listing-images").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        next.push(data.publicUrl);
      }
    }
    setImages(next);
    setBusy(false);
  };

  const removeImage = (i: number) => setImages((arr) => arr.filter((_, x) => x !== i));
  const move = (i: number, dir: -1 | 1) => {
    setImages((arr) => {
      const next = [...arr];
      const j = i + dir;
      if (j < 0 || j >= next.length) return next;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      title: String(fd.get("title") || ""),
      description: String(fd.get("description") || ""),
      price: Number(fd.get("price") || 0),
      currency: String(fd.get("currency") || "SSP"),
      category: String(fd.get("category") || ""),
      condition: String(fd.get("condition") || ""),
      city: String(fd.get("city") || ""),
    });
    if (!parsed.success) { setErr(parsed.error.issues[0]?.message || "Check the form"); return; }
    setBusy(true);
    const { error } = await supabase.from("listings").update({
      ...parsed.data,
      images,
      status: String(fd.get("status") || "active"),
    }).eq("id", id);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    navigate({ to: "/listings/$id", params: { id } });
  };

  const remove = async () => {
    if (!confirm("Delete this ad permanently?")) return;
    await supabase.from("listings").delete().eq("id", id);
    navigate({ to: "/profile" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[900px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <Link to="/profile" className="ml-auto text-[13px] font-bold text-muted-foreground hover:text-foreground">← Back</Link>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 py-8">
        <h1 className="text-[26px] font-extrabold mb-1">Edit ad</h1>
        <p className="text-[13px] text-muted-foreground mb-6">Update details or manage photos.</p>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-6 space-y-5">
          <div>
            <label className="text-[13px] font-bold block mb-1.5">Title</label>
            <input name="title" defaultValue={l.title} required maxLength={120} className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Category</label>
              <select name="category" defaultValue={l.category} required className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Condition</label>
              <select name="condition" defaultValue={l.condition || ""} required className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                <option value="">Select…</option>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_120px_140px] gap-3">
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Price</label>
              <input name="price" type="number" min={0} defaultValue={l.price ?? 0} required className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Currency</label>
              <select name="currency" defaultValue={l.currency} className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                <option>SSP</option><option>USD</option>
              </select>
            </div>
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Status</label>
              <select name="status" defaultValue={l.status} className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-bold block mb-1.5">City</label>
            <select name="city" defaultValue={l.city || ""} required className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
              <option value="">Select…</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-bold block mb-1.5">Description</label>
            <textarea name="description" defaultValue={l.description || ""} required maxLength={2000} rows={5} className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background resize-y" />
          </div>

          <div>
            <label className="text-[13px] font-bold block mb-1.5">Photos ({images.length}/6)</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {images.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded">COVER</span>}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} className="bg-white/90 text-foreground rounded px-1.5 text-[11px] font-bold">←</button>
                    <button type="button" onClick={() => move(i, 1)} className="bg-white/90 text-foreground rounded px-1.5 text-[11px] font-bold">→</button>
                    <button type="button" onClick={() => removeImage(i)} className="bg-destructive text-white rounded px-1.5 text-[11px] font-bold">✕</button>
                  </div>
                </div>
              ))}
            </div>
            {images.length < 6 && (
              <input type="file" accept="image/*" multiple onChange={(e) => uploadImages(e.target.files)} className="block w-full text-[13px] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-soft file:text-brand-dark file:font-bold" />
            )}
          </div>

          {err && <div className="text-[13px] bg-brand-soft text-brand-dark border border-brand/20 rounded-lg px-3 py-2">{err}</div>}

          <div className="flex gap-3 pt-2 flex-wrap">
            <button type="button" onClick={remove} className="px-5 py-3 rounded-xl border-2 border-destructive/40 text-destructive font-bold text-[14px] hover:bg-destructive/5 transition">Delete</button>
            <Link to="/listings/$id" params={{ id }} className="px-5 py-3 rounded-xl border-2 border-border font-bold text-[14px] hover:bg-muted transition">Cancel</Link>
            <button disabled={busy} type="submit" className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-[14px] transition">
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
