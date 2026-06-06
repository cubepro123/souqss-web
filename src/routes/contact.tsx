import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact & Support — SouqSS" },
      { name: "description", content: "Get in touch with the SouqSS team. Support, feedback, partnerships and trust & safety." },
      { property: "og:title", content: "Contact & Support — SouqSS" },
      { property: "og:description", content: "Reach the SouqSS team for help, feedback, or partnerships." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
});

const SUPPORT_EMAIL = "bolkerbino26@gmail.com";

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Support");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    const subject = encodeURIComponent(`[SouqSS · ${topic}] from ${name || "anonymous"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    toast.success("Opening your email app…");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-[820px] mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="text-[15px] font-extrabold"><span className="text-brand">souq</span>SS</Link>
          <Link to="/" className="ml-auto text-[13px] text-muted-foreground hover:text-brand">← Back home</Link>
        </div>
      </header>
      <main className="max-w-[820px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-extrabold mb-1">Contact & Support</h1>
        <p className="text-[14px] text-muted-foreground mb-8">We usually reply within 1–2 business days. Pick a channel that works for you.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {[
            { icon: "✉️", title: "Email", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
            { icon: "💬", title: "WhatsApp", value: "Chat with us", href: "https://wa.me/211000000000" },
            { icon: "📍", title: "Based in", value: "Juba, South Sudan", href: null as string | null },
          ].map((c) => {
            const inner = (
              <>
                <div className="text-2xl mb-1">{c.icon}</div>
                <div className="text-[12px] uppercase tracking-wide text-muted-foreground font-bold">{c.title}</div>
                <div className="text-[14px] font-semibold text-foreground mt-0.5 break-all">{c.value}</div>
              </>
            );
            return c.href ? (
              <a key={c.title} href={c.href} className="bg-card border border-border hover:border-brand rounded-2xl p-4 transition block">{inner}</a>
            ) : (
              <div key={c.title} className="bg-card border border-border rounded-2xl p-4">{inner}</div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 mb-10">
          <h2 className="text-[18px] font-extrabold mb-1">Send us a message</h2>
          <p className="text-[13px] text-muted-foreground mb-5">This opens your email app pre-filled — no account needed.</p>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-[12.5px] font-bold text-foreground">Your name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-[14px] focus:border-brand outline-none" placeholder="Akol M." />
              </label>
              <label className="block">
                <span className="text-[12.5px] font-bold text-foreground">Your email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-[14px] focus:border-brand outline-none" placeholder="you@example.com" />
              </label>
            </div>
            <label className="block">
              <span className="text-[12.5px] font-bold text-foreground">Topic</span>
              <select value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-[14px] focus:border-brand outline-none">
                <option>Support</option>
                <option>Report a listing or user</option>
                <option>Trust & Safety</option>
                <option>Partnership / Advertising</option>
                <option>Feedback</option>
                <option>Other</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12.5px] font-bold text-foreground">Message</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="mt-1 w-full bg-background border border-border rounded-xl px-3 py-2.5 text-[14px] focus:border-brand outline-none resize-y" placeholder="Tell us what's going on…" />
            </label>
            <button type="submit" className="bg-brand hover:bg-brand-dark text-white font-bold px-5 py-2.5 rounded-xl text-[14px] transition">
              Open email →
            </button>
          </form>
        </div>

        <section className="mb-10">
          <h2 className="text-[18px] font-extrabold mb-3">Frequent questions</h2>
          <div className="space-y-3">
            {[
              { q: "How do I report a suspicious listing?", a: "Open the listing and tap Report, or email us with the listing link and the issue. We act fast on fraud, counterfeits, and unsafe items." },
              { q: "Why was my listing removed?", a: "Listings can be removed if they violate our Terms — for example, prohibited items, misleading info, or duplicate posts. Contact us to appeal." },
              { q: "How do I delete my account?", a: "Email us from your registered address with the subject \"Delete my account\" and we'll process it within 7 days." },
              { q: "Can I advertise on SouqSS?", a: "Yes — pick the Partnership / Advertising topic above and tell us about your business." },
            ].map((f) => (
              <details key={f.q} className="bg-card border border-border rounded-xl p-4 group">
                <summary className="font-bold text-[14px] cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition">⌄</span>
                </summary>
                <p className="text-[13.5px] text-muted-foreground mt-2 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <p className="text-[12.5px] text-muted-foreground">
          See also: <Link to="/terms" className="text-brand font-semibold underline">Terms</Link> · <Link to="/privacy" className="text-brand font-semibold underline">Privacy</Link>
        </p>
      </main>
    </div>
  );
}