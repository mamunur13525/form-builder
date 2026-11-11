import { LegalLayout } from "./LegalLayout";

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="The principles, responsibilities, and standards governing your use of FormFlow."
      lastUpdated="November 11, 2026"
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using the FormFlow application, web platform, or any associated APIs
            and services provided by FormFlow ("we", "our", or "us"), you agree to be bound by
            these Terms of Service. If you are entering into this agreement on behalf of a
            company or organization, you represent that you have legal authority to bind that entity.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">2. Account Registration and Workspace Access</h2>
          <p>
            You must provide accurate and complete registration information when creating an account.
            FormFlow allows multiple workspaces, invitations, and role-based permissions (such as Owner,
            Admin, and Member). You are responsible for safeguarding your credentials and for all activities
            that occur under your account and workspaces.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">3. Acceptable Use and Content Policies</h2>
          <p>
            You agree not to use FormFlow to collect credentials, phishing payloads, malicious software,
            unauthorized personally identifiable information (PII) without consent, or to violate any
            applicable local, national, or international regulations. We reserve the right to suspend or
            terminate any form or account violating these standards.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">4. Ownership of Form Data</h2>
          <p>
            You retain 100% full ownership, rights, and title to all question data, brand assets, form
            responses, and analytics collected through your forms. FormFlow does not claim ownership,
            nor do we sell, rent, or monetize your form submissions to third parties.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">5. Subscriptions, Payments & Cancellations</h2>
          <p>
            Paid subscriptions are processed securely through our authorized merchant of record
            (Lemon Squeezy). Subscriptions renew automatically until canceled in your Workspace Billing
            portal. You may cancel at any time, retaining access through the end of your billing cycle.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">6. Service Level and Limitation of Liability</h2>
          <p>
            While we strive for 99.9% uptime, FormFlow is provided on an "as is" and "as available" basis.
            To the maximum extent permitted by law, FormFlow shall not be liable for any indirect,
            incidental, or consequential damages resulting from downtime or service interruptions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">7. Changes to Terms</h2>
          <p>
            We may update these terms from time to time to reflect product enhancements, legal
            requirements, or operational practices. Notice of material changes will be provided via
            in-app announcements or your registered email address.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
