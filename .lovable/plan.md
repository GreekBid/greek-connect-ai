# Stripe Premium + GREEKBID29 Promo Code

**$19.99/mo** Premium subscription for chapters. Without it, the chapter dashboard is **read-only**. Free access via the `GREEKBID29` promo code.

## ⚠️ Before I touch any code
Roll the live keys you pasted in chat (Stripe Dashboard → Developers → API keys → Roll on both `sk_live_…` and `rk_live_…`). I'll prompt you to paste the **new** secret key into a secure form — never in chat. The current `STRIPE_SECRET_KEY` secret will be updated to that new value.

---

## What gets built

### 1. Stripe setup (live mode)
- Verify product `prod_UJ8FgIU49VfO6Z` / price `price_1TKVz93swZrzMtulheAgOHlI` exist; create "GreekBid Premium — $19.99/mo" if not.
- Create coupon **"GreekBid Founder — 3 months free"**: 100% off, `duration: repeating`, `duration_in_months: 3`.
- Create promotion code **`GREEKBID29`** bound to that coupon, `max_redemptions: 50`, active.

After 3 months, subscribers on this code automatically roll to $19.99/mo unless they cancel — Stripe handles natively.

### 2. Edge functions (3 new, no webhooks)
- **`create-checkout`** — Stripe Checkout session, `mode: "subscription"`, `allow_promotion_codes: true` so users see a "Add promotion code" field where they type `GREEKBID29`.
- **`check-subscription`** — Looks up customer by email, returns `{ subscribed, subscription_end, discount: { code, percent_off } | null }`.
- **`customer-portal`** — Stripe Customer Portal for cancel/update card.

All three: CORS, JWT auth, structured logs, `apiVersion: "2025-08-27.basil"`.

### 3. AuthContext + read-only gate
- Extend `AuthContext` with `subscribed`, `subscriptionEnd`, `discountCode`. Calls `check-subscription` on login + every 60s for chapter users. Platform Admins always pass; rushees skip.
- New hook **`useChapterWriteAccess()`** → `boolean`.
- Apply across chapter pages — disable create/edit/delete buttons with "Premium required" tooltip:
  - BidsPage, RankingsPage, EventsPage, MessagesPage, ProfilesPage (favorite/star), MembersPage (approve/reject), SettingsPage
- Banner in `DashboardLayout` for non-subscribers: *"Read-only mode. Upgrade to Premium ($19.99/mo) — have a code? Apply at checkout."* with **Upgrade** CTA.
- Reads, AI Coach, Analytics stay open.

### 4. New `/dashboard/billing` page + sidebar entry
- **Not subscribed:** plan card, **Subscribe – $19.99/mo** button (Checkout in new tab), hint *"Have a promo code? Enter it on the next screen — try `GREEKBID29` for 3 months free."*
- **Subscribed:** active badge, renewal date, discount badge if applicable (e.g., "Free for 3 months — GREEKBID29 applied"), **Manage Subscription** button (Customer Portal).
- Manual **Refresh status** button.

### 5. Routes
- `/billing/success` → triggers `check-subscription`, redirects to `/dashboard`
- `/billing/cancel` → returns to `/dashboard/billing`

### 6. Update memory
Update `mem://features/subscription-model` to: Premium live, $19.99/mo, `GREEKBID29` promo (3mo free, capped at 50 redemptions).

---

## QA checklist
- [ ] New chapter signup → read-only mode, banner visible
- [ ] Subscribe with real card → Stripe charges $19.99 → write access unlocks (refundable from Stripe Dashboard)
- [ ] Subscribe with `GREEKBID29` → $0.00 today, full access, "Free for 3 months — GREEKBID29 applied" badge
- [ ] Cancel via Customer Portal → reverts to read-only after period end
- [ ] Rushees and Platform Admin completely unaffected

## Technical notes
- No webhooks — verifying live against Stripe each load.
- Read-only enforcement is **UI-level**. Server-side (RLS) enforcement is a separate hardening pass; want it added later, just say so.
- Promo codes managed in Stripe Dashboard going forward — adding/disabling needs no code change.
