import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign in — SouqSS" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const resend = async () => {
    if (!pendingEmail) return;
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirmed` },
    });
    setBusy(false);
    setErr(error ? error.message : "Confirmation email sent again ✓");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirmed`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        setPendingEmail(email);
        setErr("Check your inbox to confirm your email, then sign in.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.64_0.18_38)] via-[oklch(0.58_0.17_35)] to-[oklch(0.5_0.14_30)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[440px]">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-6">
          <img src={logo} alt="SouqSS" className="w-12 h-12 rounded-2xl shadow-lg" />
          <span className="text-white text-2xl font-extrabold"><span className="opacity-90">souq</span>SS</span>
        </Link>

        <div className="bg-card rounded-3xl shadow-2xl p-7">
          <div className="flex gap-1 bg-muted p-1 rounded-xl mb-5">
            <button onClick={() => setMode("signin")} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition ${mode === "signin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>Sign in</button>
            <button onClick={() => setMode("signup")} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition ${mode === "signup" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>Create account</button>
          </div>

          <h1 className="text-[22px] font-extrabold text-foreground mb-1">
            {mode === "signin" ? "Welcome back" : "Join SouqSS"}
          </h1>
          <p className="text-[13px] text-muted-foreground mb-5">
            {mode === "signin" ? "Sign in to post ads and message sellers." : "Free forever. Takes 30 seconds."}
          </p>

          <form onSubmit={handleSubmit} method="post" autoComplete="on" className="space-y-3">
            {mode === "signup" && (
              <div>
                <label htmlFor="displayName" className="text-[12px] font-bold text-foreground mb-1 block">Display name</label>
                <input id="displayName" name="name" autoComplete="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} placeholder="e.g. Ahmed M." className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-[12px] font-bold text-foreground mb-1 block">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} placeholder="you@email.com" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-[12px] font-bold text-foreground block">Password</label>
                {mode === "signin" && (
                  <Link to="/forgot-password" className="text-[11.5px] font-bold text-brand hover:text-brand-dark">Forgot?</Link>
                )}
              </div>
              <input id="password" name="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>

            {err && <div className="text-[12.5px] bg-brand-soft text-brand-dark border border-brand/20 rounded-lg px-3 py-2">{err}</div>}

            <button disabled={busy} type="submit" className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl text-[14px] transition shadow-[0_4px_14px_oklch(0.64_0.18_38_/_0.35)]">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/80 text-[12px] mt-5">
          <Link to="/" className="hover:underline">← Back to SouqSS</Link>
        </p>
      </div>
    </div>
  );
}
