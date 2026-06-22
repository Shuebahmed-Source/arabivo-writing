import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Arabivo",
  description: "How Arabivo collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="mkt-privacy">
      <div className="mkt-privacy-inner">
        <h1 className="mkt-privacy-title">Privacy Policy</h1>
        <p className="mkt-privacy-updated">Last updated: 21 June 2026</p>

        <p className="mkt-privacy-lead">
          Arabivo (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your
          privacy. This Privacy Policy explains what information we collect, how we use it, and the
          choices you have. By using the Arabivo app or website, you agree to the practices
          described here.
        </p>

        <section>
          <h2>Information We Collect</h2>

          <h3>Account Information</h3>
          <p>
            When you create an account, we collect your email address and name through our
            authentication provider (Clerk). This is used to identify you, secure your account,
            and let you sign in across devices.
          </p>

          <h3>Purchase Information</h3>
          <p>
            If you subscribe to Arabivo Pro or make a one-time purchase, we (through our payment
            processing partner, RevenueCat, and Apple&rsquo;s App Store) collect purchase history
            and subscription status. This is used to verify your access to premium features and to
            process renewals, restores, and refunds.
          </p>

          <h3>App Activity and Progress Data</h3>
          <p>
            We store the lessons you complete, your practice history, streaks, and other progress
            data in our database (Supabase) so your progress is saved and synced across your
            devices. This data is linked to your account.
          </p>

          <h3>Usage and Analytics Data</h3>
          <p>
            We use PostHog to understand how people use Arabivo — for example, which screens are
            visited, which features are used, and general app performance. This may include device
            identifiers and interaction data (such as taps and screen views). Where you are signed
            in, this usage data may be linked to your account so we can improve your experience.
          </p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use the information described above to:</p>
          <ul>
            <li>Provide and maintain your account and app functionality</li>
            <li>Process purchases and manage subscriptions</li>
            <li>Save and sync your learning progress</li>
            <li>Understand how the app is used so we can improve it</li>
            <li>Communicate with you about your account or purchases</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>
            We do not sell your personal data. We do not use your data for third-party advertising,
            and we do not share your data with data brokers.
          </p>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>
            Arabivo uses the following third-party services, each of which processes data on our
            behalf under their own privacy and security practices:
          </p>
          <ul>
            <li><strong>Clerk</strong> — authentication and account management</li>
            <li><strong>RevenueCat</strong> — subscription and purchase management</li>
            <li><strong>Apple App Store / StoreKit</strong> — payment processing for App Store purchases</li>
            <li><strong>Supabase</strong> — database storage for app and progress data</li>
            <li><strong>PostHog</strong> — product analytics</li>
          </ul>
          <p>
            These providers only receive the data necessary to perform their function and are
            contractually required to protect it.
          </p>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            We retain your account and progress data for as long as your account is active. If you
            delete your account, we will delete or anonymize your personal data within a reasonable
            period, except where we are required to retain certain records (for example, purchase
            records) for legal or accounting purposes.
          </p>
        </section>

        <section>
          <h2>Your Rights and Choices</h2>

          <h3>Account Deletion</h3>
          <p>
            You can delete your account at any time from within the app (Settings → Delete
            Account). This will permanently remove your account and associated personal data,
            subject to the retention exceptions noted above.
          </p>

          <h3>Access</h3>
          <p>
            You can contact us at{" "}
            <a href="mailto:shueb3685@gmail.com">shueb3685@gmail.com</a> to request a copy of
            the data we hold about you, or to correct inaccurate information.
          </p>

          <h3>Restore Purchases</h3>
          <p>
            If you reinstall the app or switch devices, you can restore your previous purchases
            from within the app.
          </p>
        </section>

        <section>
          <h2>Children&rsquo;s Privacy</h2>
          <p>
            Arabivo is not directed at children under 13 (or the relevant minimum age in your
            country), and we do not knowingly collect personal data from children. If you believe
            a child has provided us with personal data, please contact us so we can delete it.
          </p>
        </section>

        <section>
          <h2>Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect your information.
            However, no method of transmission or storage is completely secure, and we cannot
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we make material changes, we
            will notify you through the app or by other reasonable means. The &ldquo;Last
            updated&rdquo; date above reflects the most recent revision.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle your data, contact
            us at:{" "}
            <a href="mailto:shueb3685@gmail.com">shueb3685@gmail.com</a>
          </p>
        </section>
      </div>
    </main>
  );
}
