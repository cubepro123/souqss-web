import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset password — SouqSS" },
      { name: "description", content: "Reset your SouqSS account password." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setMsg("Check your inbox for a reset link.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.64_0.18_38)] via-[oklch(0.58_0.17_35)] to-[oklch(0.5_0.14_30)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <img src={logo} alt="SouqSS" className="w-12 h-12 rounded-2xl shadow-lg" />
          <span className="text-white text-2xl font-extrabold"><span className="opacity-90">souq</span>SS</span>
        </Link>

        <div className="bg-card rounded-3xl shadow-2xl p-7">
          <h1 className="text-[22px] font-extrabold mb-1">Forgot your password?</h1>
          <p className="text-[13px] text-muted-foreground mb-5">Enter your email and we'll send a reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className="text-[12px] font-bold mb-1 block">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>

            {msg && <div className="text-[12.5px] bg-brand-soft text-brand-dark border border-brand/20 rounded-lg px-3 py-2">{msg}</div>}
            {err && <div className="text-[12.5px] bg-brand-soft text-brand-dark border border-brand/20 rounded-lg px-3 py-2">{err}</div>}

            <button disabled={busy} type="submit" className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-[14px] transition">
              {busy ? "Sending…" : "Send reset link"}
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
