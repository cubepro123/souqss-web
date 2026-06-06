import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({ meta: [{ title: "Set new password — SouqSS" }] }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // Supabase auto-handles the recovery token in the URL hash and emits a session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setMsg("Password updated. Redirecting…");
    setTimeout(() => navigate({ to: "/" }), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.64_0.18_38)] via-[oklch(0.58_0.17_35)] to-[oklch(0.5_0.14_30)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <img src={logo} alt="SouqSS" className="w-12 h-12 rounded-2xl shadow-lg" />
          <span className="text-white text-2xl font-extrabold"><span className="opacity-90">souq</span>SS</span>
        </Link>

        <div className="bg-card rounded-3xl shadow-2xl p-7">
          <h1 className="text-[22px] font-extrabold mb-1">Set a new password</h1>
          <p className="text-[13px] text-muted-foreground mb-5">
            {ready ? "Choose a new password for your account." : "Verifying your reset link…"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="new-password" className="text-[12px] font-bold mb-1 block">New password</label>
              <input id="new-password" name="password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>

            {msg && <div className="text-[12.5px] bg-brand-soft text-brand-dark border border-brand/20 rounded-lg px-3 py-2">{msg}</div>}
            {err && <div className="text-[12.5px] bg-brand-soft text-brand-dark border border-brand/20 rounded-lg px-3 py-2">{err}</div>}

            <button disabled={busy || !ready} type="submit" className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-[14px] transition">
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/80 text-[12px] mt-5">
          <Link to="/auth" className="hover:underline">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
