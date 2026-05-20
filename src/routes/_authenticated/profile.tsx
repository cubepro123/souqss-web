import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "My profile — SouqSS" }] }),
});

type Profile = { display_name: string | null; phone: string | null; city: string | null; avatar_url: string | null };
type Listing = { id: string; title: string; price: number | null; currency: string; images: string[]; created_at: string; status: string };

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>({ display_name: "", phone: "", city: "", avatar_url: "" });
  const [listings, setListings] = useState<Listing[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name,phone,city,avatar_url").eq("id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setProfile(data); });
    supabase.from("listings").select("id,title,price,currency,images,created_at,status").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setListings(data || []));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setBusy(true); setMsg(null);
    const { error } = await supabase.from("profiles").update({
      display_name: profile.display_name?.slice(0, 60) || null,
      phone: profile.phone?.slice(0, 30) || null,
      city: profile.city?.slice(0, 60) || null,
    }).eq("id", user.id);
    setBusy(false);
    setMsg(error ? error.message : "Saved ✓");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const deleteListing = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    await supabase.from("listings").delete().eq("id", id);
    setListings((l) => l.filter((x) => x.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-[900px] mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="SouqSS" className="w-9 h-9 rounded-xl" />
            <span className="text-[20px] font-extrabold"><span className="text-brand">souq</span>SS</span>
          </Link>
          <button onClick={signOut} className="ml-auto text-[13px] font-bold text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-4 py-8 space-y-8">
        <section className="bg-card rounded-3xl border border-border p-6">
          <h1 className="text-[22px] font-extrabold mb-1">My profile</h1>
          <p className="text-[13px] text-muted-foreground mb-5">{user?.email}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold block mb-1.5">Display name</label>
              <input value={profile.display_name || ""} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} maxLength={60} className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div>
              <label className="text-[12px] font-bold block mb-1.5">Phone</label>
              <input value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} maxLength={30} placeholder="+211 …" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[12px] font-bold block mb-1.5">City</label>
              <input value={profile.city || ""} onChange={(e) => setProfile({ ...profile, city: e.target.value })} maxLength={60} placeholder="e.g. Juba" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
          </div>

          {msg && <div className="mt-3 text-[13px] text-brand-dark">{msg}</div>}

          <button disabled={busy} onClick={save} className="mt-5 bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl text-[14px] transition">
            {busy ? "Saving…" : "Save changes"}
          </button>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-extrabold">My ads ({listings.length})</h2>
            <Link to="/post-ad" className="bg-brand hover:bg-brand-dark text-white font-bold px-4 py-2 rounded-xl text-[13px]">+ Post new ad</Link>
          </div>

          {listings.length === 0 ? (
            <div className="bg-card border-2 border-dashed border-border rounded-2xl p-10 text-center">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-[14px] text-muted-foreground">You haven't posted any ads yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {listings.map((l) => (
                <div key={l.id} className="bg-card border border-border rounded-2xl p-3 flex gap-3">
                  <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden shrink-0">
                    {l.images?.[0] ? <img src={l.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[14px] line-clamp-2">{l.title}</div>
                    <div className="text-price font-extrabold text-[13px] mt-1">{l.currency} {l.price?.toLocaleString() ?? "—"}</div>
                    <button onClick={() => deleteListing(l.id)} className="text-[11.5px] text-muted-foreground hover:text-brand font-semibold mt-1">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
