import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto prose prose-stone">
        <Link to="/" className="text-primary text-sm">← Back to home</Link>
        <h1 className="text-3xl font-display font-bold text-foreground mt-6">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: May 14, 2026</p>

        <section className="mt-8 space-y-4 text-foreground text-sm leading-relaxed">
          <p>By creating an account on GreekBid you agree to these terms. GreekBid is a platform that helps fraternity and sorority chapters manage rush and bid processes alongside the rushees they recruit.</p>

          <h2 className="text-xl font-display font-semibold mt-6">1. Eligibility</h2>
          <p>You must be at least 17 years old and a current or prospective member of a recognized Greek-letter organization or college student community.</p>

          <h2 className="text-xl font-display font-semibold mt-6">2. Account Responsibility</h2>
          <p>You are responsible for safeguarding your password and for any activity under your account. Notify us immediately at admin@greekbid.com if you suspect unauthorized access.</p>

          <h2 className="text-xl font-display font-semibold mt-6">3. Acceptable Use</h2>
          <p>You agree not to harass, dox, or share private information about other users; not to misrepresent your identity, college, or chapter affiliation; and not to attempt to bypass our isolation between schools or organizations.</p>

          <h2 className="text-xl font-district font-semibold mt-6">4. Chapter Content</h2>
          <p>Chapters are responsible for the accuracy of their roster and the conduct of their members. GreekBid may suspend chapter accounts that violate these terms or applicable law.</p>

          <h2 className="text-xl font-display font-semibold mt-6">5. Subscriptions</h2>
          <p>Paid features are billed monthly via Stripe. You can cancel anytime from the Billing page. No refunds for partial months unless required by law.</p>

          <h2 className="text-xl font-display font-semibold mt-6">6. Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting admin@greekbid.com.</p>

          <h2 className="text-xl font-display font-semibold mt-6">7. Disclaimer</h2>
          <p>GreekBid is provided "as is" without warranties of any kind. We are not affiliated with any national fraternity or sorority and do not guarantee outcomes of any rush or bid process.</p>

          <h2 className="text-xl font-display font-semibold mt-6">8. Contact</h2>
          <p>Questions? Email <a href="mailto:admin@greekbid.com" className="text-primary">admin@greekbid.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
