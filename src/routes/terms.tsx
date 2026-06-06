import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      { title: "Terms & Conditions — SouqSS" },
      { name: "description", content: "SouqSS Terms & Conditions governing use of South Sudan's marketplace." },
      { property: "og:title", content: "Terms & Conditions — SouqSS" },
      { property: "og:description", content: "Terms governing use of the SouqSS marketplace." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
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

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-[820px] mx-auto px-4 h-14 flex items-center">
          <Link to="/" className="text-[15px] font-extrabold"><span className="text-brand">souq</span>SS</Link>
          <Link to="/" className="ml-auto text-[13px] text-muted-foreground hover:text-brand">← Back home</Link>
        </div>
      </header>
      <main className="max-w-[820px] mx-auto px-4 py-10">
        <h1 className="text-[28px] font-extrabold mb-1">Terms & Conditions</h1>
        <p className="text-[12.5px] text-muted-foreground mb-8">Last updated: June 6, 2026</p>

        <Section title="General Terms">
          <p>By accessing and using SouqSS, you confirm you agree to and are bound by these Terms & Conditions. These terms apply to the entire site and any communication between you and SouqSS.</p>
          <p>Under no circumstances shall the SouqSS team be liable for any direct, indirect, special, incidental or consequential damages, including loss of data or profit, arising from the use of, or inability to use, the materials on this site.</p>
          <p>SouqSS is not responsible for outcomes during use of the platform. We reserve the right to change prices and revise our usage policy at any time.</p>
        </Section>

        <Section title="License">
          <p>SouqSS grants you a revocable, non-exclusive, non-transferable, limited license to use the website strictly in accordance with this Agreement.</p>
          <p>If you do not agree to these Terms, please do not use the SouqSS service. If you violate any of these terms, we reserve the right to cancel your account or block access without notice.</p>
        </Section>

        <Section title="Definitions">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><b>Cookie:</b> small data saved by your browser to identify it and remember preferences.</li>
            <li><b>Company:</b> "we", "us", "our" refers to SouqSS, based in South Sudan.</li>
            <li><b>Device:</b> any internet-connected device used to access SouqSS.</li>
            <li><b>Service:</b> the marketplace and related features provided by SouqSS.</li>
            <li><b>Third-party service:</b> advertisers, partners and providers whose content appears on SouqSS.</li>
            <li><b>You:</b> a person or entity registered with SouqSS to use the Services.</li>
          </ul>
        </Section>

        <Section title="Restrictions">
          <p>You agree not to, and will not permit others to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>License, sell, rent, lease, distribute, host or otherwise commercially exploit the platform.</li>
            <li>Modify, disassemble, reverse engineer or create derivative works of any part of the website.</li>
            <li>Remove or obscure any proprietary notice of SouqSS or its partners.</li>
            <li>Post illegal, fraudulent, counterfeit, stolen, dangerous, or prohibited items.</li>
            <li>Harass other users, send spam, or impersonate any person or business.</li>
          </ul>
        </Section>

        <Section title="User-Generated Listings">
          <p>SouqSS is a venue connecting buyers and sellers. We do not own, inspect, or guarantee any items or services posted. Transactions occur directly between users. You are solely responsible for the listings you post and the accuracy of their content.</p>
          <p>We may remove any listing at our sole discretion if it violates these terms, applicable law, or our community guidelines.</p>
        </Section>

        <Section title="Payment">
          <p>If you pay for any paid features, you agree to pay all fees and charges in accordance with the billing terms in effect at the time. SouqSS may change its prices at any time, with notice provided on this site or via email.</p>
        </Section>

        <Section title="Returns & Refunds">
          <p>Returns and refunds for items purchased between users are handled directly between buyer and seller. If you are not satisfied with a transaction, please contact the seller first, then reach out to us so we can help mediate.</p>
        </Section>

        <Section title="Your Suggestions">
          <p>Any feedback, comments, ideas or suggestions ("Suggestions") you provide to SouqSS shall remain the sole property of SouqSS, which may use them freely without compensation.</p>
        </Section>

        <Section title="Your Consent">
          <p>By using our website, registering an account, or making a purchase, you consent to these Terms & Conditions and our Privacy Policy.</p>
        </Section>

        <Section title="Links to Other Websites">
          <p>The Services may contain links to other websites not controlled by SouqSS. We are not responsible for their content or practices. Your interaction on those sites is subject to their own rules and policies.</p>
        </Section>

        <Section title="Cookies">
          <p>SouqSS uses cookies to enhance performance and functionality. Most browsers can disable cookies, but doing so may limit your ability to use parts of our site. We never place personally identifiable information in cookies.</p>
        </Section>

        <Section title="Changes to These Terms">
          <p>SouqSS may stop providing the Service (or any feature) at any time, at our discretion, without prior notice. If we change our Terms, we'll post updates on this page and update the date above. For material changes we will provide at least 30 days' notice.</p>
        </Section>

        <Section title="Term & Termination">
          <p>This Agreement remains in effect until terminated by you or SouqSS. We may suspend or terminate it at any time, with or without notice, in our sole discretion — for example, if you fail to comply with any provision.</p>
        </Section>

        <Section title="Disclaimer of Warranties">
          <p>The website is provided "as is" and "as available", without warranty of any kind. SouqSS does not warrant that the site will be uninterrupted, error-free, secure, or that the information provided is accurate or current.</p>
        </Section>

        <Section title="Limitation of Liability">
          <p>The entire liability of SouqSS under any provision of this Agreement shall be limited to the amount actually paid by you for use of the website. Some jurisdictions don't allow these limitations, so they may not apply to you.</p>
        </Section>

        <Section title="Dispute Resolution">
          <p>In the event of a dispute, you must give SouqSS a Notice of Dispute in writing by emailing <a href="mailto:bolkerbino26@gmail.com" className="text-brand font-semibold">bolkerbino26@gmail.com</a>, setting out the facts and the relief requested. You and SouqSS will attempt to resolve any dispute through informal negotiation within 60 days before pursuing further action.</p>
        </Section>

        <Section title="Entire Agreement">
          <p>This Agreement constitutes the entire agreement between you and SouqSS regarding your use of the website and supersedes all prior agreements.</p>
        </Section>

        <Section title="Contact Us">
          <p>Questions about these Terms? Visit our <Link to="/contact" className="text-brand font-semibold underline">contact page</Link> or email <a href="mailto:bolkerbino26@gmail.com" className="text-brand font-semibold">bolkerbino26@gmail.com</a>.</p>
        </Section>
      </main>
    </div>
  );
}