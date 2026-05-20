import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
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
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
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

  const handleGoogle = async () => {
    setErr(null);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) setErr(res.error.message || "Google sign-in failed");
    else if (!res.redirected) navigate({ to: "/" });
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

          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-2.5 bg-card border-2 border-border hover:border-foreground/30 rounded-xl py-2.5 font-semibold text-[14px] text-foreground transition mb-4">
            <svg viewBox="0 0 24 24" className="w-4 h-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-card text-[11px] text-muted-foreground uppercase tracking-wider font-bold">or with email</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-[12px] font-bold text-foreground mb-1 block">Display name</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} placeholder="e.g. Ahmed M." className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
              </div>
            )}
            <div>
              <label className="text-[12px] font-bold text-foreground mb-1 block">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} placeholder="you@email.com" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
            </div>
            <div>
              <label className="text-[12px] font-bold text-foreground mb-1 block">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="w-full px-3 py-2.5 rounded-xl border-2 border-border focus:border-brand outline-none text-[14px] bg-background" />
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
