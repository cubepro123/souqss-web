import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth/confirmed")({
  component: ConfirmedPage,
  head: () => ({ meta: [{ title: "Email confirmed — SouqSS" }] }),
});

function ConfirmedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.64_0.18_38)] via-[oklch(0.58_0.17_35)] to-[oklch(0.5_0.14_30)] px-4">
      <div className="bg-card rounded-3xl shadow-2xl p-8 max-w-[440px] w-full text-center">
        <img src={logo} alt="" className="w-14 h-14 mx-auto rounded-2xl mb-4" />
        <div className="text-5xl mb-2">✓</div>
        <h1 className="text-[22px] font-extrabold mb-2">You're all set!</h1>
        <p className="text-[13.5px] text-muted-foreground mb-6">Your email is confirmed. You can sign in now.</p>
        <Link to="/auth" className="inline-block bg-brand hover:bg-brand-dark text-white font-bold px-6 py-3 rounded-xl text-[14px]">Sign in</Link>
      </div>
    </div>
  );
}
