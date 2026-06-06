import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/post-ad")({
  component: PostAd,
  head: () => ({ meta: [{ title: "Post an ad — SouqSS" }] }),
});

const CATEGORIES = ["Electronics", "Vehicles", "Real Estate", "Fashion", "Home & Furniture", "Services", "Jobs", "Food", "Pets", "Beauty & Care", "Babies & Kids", "Farming", "For Sale"];
const CONDITIONS = ["Brand New", "Like New", "Used", "For Parts"];
const CITIES = ["Juba", "Wau", "Malakal", "Yei", "Aweil", "Bor", "Rumbek", "Other"];

const schema = z.object({
  title: z.string().trim().min(5, "Title is too short").max(120, "Title too long"),
  description: z.string().trim().min(10, "Tell buyers more about the item").max(2000),
  price: z.number().min(0, "Price must be 0 or more").max(999999999),
  currency: z.enum(["SSP", "USD"]),
  category: z.string().min(1, "Pick a category"),
  condition: z.string().min(1, "Pick a condition"),
  city: z.string().min(1, "Pick a city"),
});

function PostAd() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).slice(0, 6);
    setFiles(arr);
    setPreviews(arr.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    if (!user) return;
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
    if (!parsed.success) {
      setErr(parsed.error.issues[0]?.message || "Please check the form");
      return;
    }
    setBusy(true);
    try {
      // Upload images
      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("listing-images").upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        ...parsed.data,
        images: urls,
      });
      if (error) throw error;
      navigate({ to: "/" });
    } catch (e: any) {
      setErr(e?.message || "Could not post your ad");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[900px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <span className="ml-auto text-[13px] text-muted-foreground">Posting as <span className="font-bold text-foreground">{user?.email}</span></span>
        </div>
      </header>

      <main className="max-w-[760px] mx-auto px-4 py-8">
        <h1 className="text-[28px] font-extrabold mb-1">Post a new ad</h1>
        <p className="text-[14px] text-muted-foreground mb-6">Reach thousands of buyers across South Sudan in minutes.</p>

        <form onSubmit={handleSubmit} className="bg-card rounded-3xl border border-border p-6 space-y-5">
          <div>
            <label className="text-[13px] font-bold block mb-1.5">Title</label>
            <input name="title" required maxLength={120} placeholder="e.g. iPhone 14 Pro Max 256GB — sealed" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Category</label>
              <select name="category" required className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Condition</label>
              <select name="condition" required className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                <option value="">Select…</option>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Price</label>
              <input name="price" type="number" min={0} required placeholder="0" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div>
              <label className="text-[13px] font-bold block mb-1.5">Currency</label>
              <select name="currency" defaultValue="SSP" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
                <option>SSP</option><option>USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-bold block mb-1.5">City</label>
            <select name="city" required className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background">
              <option value="">Select…</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-bold block mb-1.5">Description</label>
            <textarea name="description" required maxLength={2000} rows={5} placeholder="Condition, features, why you're selling, contact preferences…" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background resize-y" />
          </div>

          <div>
            <label className="text-[13px] font-bold block mb-1.5">Photos (up to 6)</label>
            <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} className="block w-full text-[13px] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-soft file:text-brand-dark file:font-bold hover:file:bg-brand/20" />
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {err && <div className="text-[13px] bg-brand-soft text-brand-dark border border-brand/20 rounded-lg px-3 py-2">{err}</div>}

          <div className="flex gap-3 pt-2">
            <Link to="/" className="px-5 py-3 rounded-xl border-2 border-border font-bold text-[14px] hover:bg-muted transition">Cancel</Link>
            <button disabled={busy} type="submit" className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-[14px] transition shadow-[0_4px_14px_oklch(0.64_0.18_38_/_0.35)]">
              {busy ? "Posting…" : "Post ad"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
