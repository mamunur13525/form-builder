import { LegalLayout } from "./LegalLayout";

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="How FormFlow collects, protects, processes, and respects your data and your respondents' privacy."
      lastUpdated="November 11, 2026"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">1. Introduction</h2>
          <p>
            FormFlow ("we", "our", or "us") is committed to protecting your privacy and ensuring transparency
            in all data interactions. This Privacy Policy describes how we handle personal data when you use
            our application, visual form builder, response collection endpoints, and collaboration tools.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">2. Information We Collect</h2>
          <p>
            We collect information strictly necessary to provide and optimize our service:
          </p>
          <ul className="list-disc space-y-1.5 pl-6 text-zinc-300">
            <li>
              <strong>Account Information:</strong> Your name, email address, password hash, and workspace preferences.
            </li>
            <li>
              <strong>Form Designs & Configurations:</strong> Form questions, pages, logic rules, styling, and webhooks.
            </li>
            <li>
              <strong>Form Submissions:</strong> Answers provided by end-users submitting your forms. As the form creator, you act as the data controller of this data, and FormFlow acts as the data processor.
            </li>
            <li>
              <strong>Technical & Usage Telemetry:</strong> Anonymized submission counts, completion rates, device types, and system logs used solely for diagnosing performance and showing analytics.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">3. How We Use Information</h2>
          <p>
            We use your information exclusively to operate the FormFlow platform, execute logic rules,
            dispatch configured webhooks, process subscription payments, send critical workspace updates,
            and protect against abusive traffic or fraud.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">4. Sub-Processors & Infrastructure</h2>
          <p>
            FormFlow partners with industry-leading, compliant infrastructure and payment providers:
          </p>
          <ul className="list-disc space-y-1.5 pl-6 text-zinc-300">
            <li>
              <strong>Lemon Squeezy:</strong> PCI-compliant billing and subscription management.
            </li>
            <li>
              <strong>ImageKit:</strong> High-performance media optimization, image hosting, and CDN delivery.
            </li>
            <li>
              <strong>Cloud Hosting & Databases:</strong> Encrypted databases with TLS 1.3 in-transit and AES-256 at-rest.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">5. Data Retention & Deletion</h2>
          <p>
            You have full control over your data. If you delete a form, question, or workspace, its submissions
            and assets are permanently purged from active databases according to our retention cycle.
            Account closure requests result in complete removal of your personal profile.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">6. Your Rights (GDPR & CCPA)</h2>
          <p>
            Depending on your jurisdiction, you have the right to access, rectify, export, or erase
            your personal data, and to restrict or object to certain processing activities. To exercise
            these rights, contact our privacy team at <span className="text-[#FF5722]">privacy@formflow.dev</span>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
