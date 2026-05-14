import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-primary text-sm">← Back to home</Link>
        <h1 className="text-3xl font-display font-bold text-foreground mt-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: May 14, 2026</p>

        <section className="mt-8 space-y-4 text-foreground text-sm leading-relaxed">
          <h2 className="text-xl font-display font-semibold mt-6">What we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account info: name, email, college, gender, organization type, role.</li>
            <li>Profile content you choose to share: bio, major, hometown, social handles, interests, avatar.</li>
            <li>Chapter activity: events, RSVPs, messages, rankings, bids, notes.</li>
            <li>Billing data (handled by Stripe — we never see your card number).</li>
          </ul>

          <h2 className="text-xl font-display font-semibold mt-6">How we use it</h2>
          <p>To operate the platform: matching rushees with chapters at their college, powering messaging, tracking the bid pipeline, and sending transactional emails (account confirmation, member approval, password reset).</p>

          <h2 className="text-xl font-display font-semibold mt-6">Who can see your data</h2>
          <p>Your profile is visible only to chapter accounts and rushees at the same college and organization type. Email addresses are not visible to other users — only to you, your chapter admins, and platform admins. Cross-school data leakage is prevented at the database level.</p>

          <h2 className="text-xl font-display font-semibold mt-6">Sharing</h2>
          <p>We do not sell personal data. We share limited data with: Supabase (hosting), Stripe (payments), Resend (email), and Lovable AI (AI Coach prompts only).</p>

          <h2 className="text-xl font-display font-semibold mt-6">Your rights</h2>
          <p>You can edit or delete your profile at any time, unsubscribe from emails via any email footer, or request full account deletion by emailing admin@greekbid.com.</p>

          <h2 className="text-xl font-display font-semibold mt-6">Security</h2>
          <p>We use TLS in transit, row-level security policies in our database, leaked-password protection on signup, and SECURITY DEFINER functions to gate sensitive reads. No system is 100% secure — report concerns to admin@greekbid.com.</p>

          <h2 className="text-xl font-display font-semibold mt-6">Contact</h2>
          <p>Privacy questions: <a href="mailto:admin@greekbid.com" className="text-primary">admin@greekbid.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
