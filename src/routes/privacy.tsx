import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — SouqSS" },
      { name: "description", content: "How SouqSS collects, uses, and protects your personal information." },
      { property: "og:title", content: "Privacy Policy — SouqSS" },
      { property: "og:description", content: "How SouqSS handles your data." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-[18px] font-extrabold text-foreground mb-2">{title}</h2>
      <div className="text-[14px] text-foreground/80 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-[820px] mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="text-[15px] font-extrabold"><span className="text-brand">souq</span>SS</Link>
          <Link to="/" className="ml-auto text-[13px] text-muted-foreground hover:text-brand">← Back home</Link>
        </div>
      </header>
      <main className="max-w-[820px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-extrabold mb-1">Privacy Policy</h1>
        <p className="text-[12.5px] text-muted-foreground mb-8">Last updated: June 6, 2026</p>

        <Section title="Introduction">
          <p>SouqSS ("we", "us", "our") respects your privacy. This policy explains what information we collect, how we use it, and the choices you have. By using SouqSS you agree to the practices described here.</p>
        </Section>

        <Section title="Information We Collect">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><b>Account info:</b> name, email, phone number, password (hashed), and profile photo if you upload one.</li>
            <li><b>Listings & shop content:</b> titles, descriptions, prices, images, categories, and location you choose to share.</li>
            <li><b>Messages:</b> conversations between buyers and sellers sent through our inbox.</li>
            <li><b>Usage data:</b> pages viewed, searches made, device and browser info, IP address, and approximate location.</li>
            <li><b>Cookies & local storage:</b> small files used to keep you signed in, remember your preferences (like Data Saver mode), and improve performance.</li>
          </ul>
        </Section>

        <Section title="How We Use Information">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Provide and operate the marketplace (showing listings, processing messages, running search).</li>
            <li>Authenticate you and keep your account secure.</li>
            <li>Detect and prevent fraud, abuse, and violations of our Terms.</li>
            <li>Communicate with you about your account, listings, and important updates.</li>
            <li>Improve our features and understand how SouqSS is used.</li>
          </ul>
        </Section>

        <Section title="Sharing Information">
          <p>We do not sell your personal data. We share information only when:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><b>Other users see public content</b> you choose to publish (listings, shop profile, public messages).</li>
            <li><b>Service providers</b> help us run SouqSS (hosting, authentication, analytics) under strict confidentiality.</li>
            <li><b>Legal reasons</b> require disclosure, such as compliance with law or to protect rights and safety.</li>
          </ul>
        </Section>

        <Section title="Data Security">
          <p>We use industry-standard measures including encrypted connections (HTTPS), hashed passwords, and row-level security on our database to protect your information. No system is 100% secure, but we work hard to keep your data safe.</p>
        </Section>

        <Section title="Your Rights & Choices">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><b>Access & update</b> your profile information at any time from the Profile page.</li>
            <li><b>Delete your listings or account</b> by contacting us at <a href="mailto:bolkerbino26@gmail.com" className="text-brand font-semibold">bolkerbino26@gmail.com</a>.</li>
            <li><b>Manage cookies</b> through your browser settings. Disabling them may limit some features.</li>
            <li><b>Opt out of marketing</b> emails using the unsubscribe link.</li>
          </ul>
        </Section>

        <Section title="Children">
          <p>SouqSS is not intended for users under 13 (or the minimum age in your country). We do not knowingly collect information from children. If you believe a child has provided us data, please contact us so we can remove it.</p>
        </Section>

        <Section title="Data Retention">
          <p>We keep your information only as long as your account is active or as needed to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements.</p>
        </Section>

        <Section title="International Users">
          <p>SouqSS is operated from South Sudan. By using the Service you understand your information will be processed in South Sudan and other countries where our service providers operate.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>We may update this policy from time to time. Significant changes will be posted on this page with a new "Last updated" date. Continued use of SouqSS after changes means you accept the updated policy.</p>
        </Section>

        <Section title="Contact">
          <p>Questions about your privacy? Email <a href="mailto:bolkerbino26@gmail.com" className="text-brand font-semibold">bolkerbino26@gmail.com</a> or visit the <Link to="/contact" className="text-brand font-semibold underline">contact page</Link>.</p>
        </Section>
      </main>
    </div>
  );
}