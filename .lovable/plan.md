# Visual & Flow Improvements

I screenshotted the landing page and a few things stand out. Here's what I'd fix, ranked by impact.

---

## 🔴 Visible bugs (fix first)

1. **The "Join GreekBid" hero card on the right is washed out / barely visible.** It looks like a broken element — text and button are at ~20% opacity against the cream background. Either it's intentional decoration (then it shouldn't look like a CTA), or the styling is broken. Replace with a real visual: a product screenshot, a stylized phone/dashboard mockup, or remove it and center the hero copy.

2. **No logo in the top nav on landing.** The `<img src="/logo.png">` is there in code but isn't rendering at the size you'd expect. Either the asset path is wrong or the `h-16` class is too tall and getting clipped. Should anchor the brand at top-left.

3. **Two "Get Started" CTAs in the hero area** (top-right button + the faded right card) compete with the two primary buttons ("I'm a Chapter" / "I'm Rushing"). Pick one primary path per fold.

## 🟠 Landing page flow

4. **Above-the-fold needs proof.** Right now the hero says "all-in-one platform" but there's nothing to anchor that claim. Add either: (a) a product screenshot of the dashboard, (b) 3 logos of pilot chapters, or (c) a single "trusted by X chapters at Y schools" stat. Without it, the hero feels like a template.

5. **Two CTAs of the same weight in the hero confuse the user.** "I'm a Chapter" and "I'm Rushing" are both filled+outline at equal weight. Make Chapter the primary (filled, larger) since they're the paying customer; rushee is a secondary text link or smaller outline.

6. **"For Chapters / For Rushees" section repeats the features section.** The bullet lists are 80% the same content the user just scrolled past. Either remove the features grid or remove the dual-column section — pick one.

7. **Footer is too sparse.** Add a column layout: Product (Features, Pricing, FAQ) · Company (About, Contact) · Legal (Terms, Privacy). Right now it's one line, which feels unfinished.

## 🟡 Auth & onboarding flow

8. **Signup → first-time experience has no welcome state.** A new chapter admin lands on an empty dashboard with no clear "do this next" prompt. Add a checklist card ("Create your first event · Invite members · Add your first rushee") that disappears once each step is done. Same for rushees ("Complete your profile · Browse chapters · RSVP to an event").

9. **Pending approval gate is a dead end.** Right now if a chapter member is awaiting admin approval, the page just says "Pending Approval" with no estimated time, no way to nudge the admin, no link to find another chapter. Add: "Your admin has been notified" + a button to message the admin or pick a different chapter.

10. **No password strength indicator** on signup. With HIBP enabled, users get a generic error if their password is leaked — show a strength meter and the HIBP rule upfront so they don't hit the wall.

11. **Signup form is missing legal acceptance.** Should have a "I agree to the Terms and Privacy Policy" checkbox linking to the new pages, both for legal cover and to set expectations.

## 🟡 In-app polish

12. **Sidebar badge counts (DMs, events, bids) are polling-based.** That's fine, but they should fade in instead of popping in. Also, when count is 0 the badge should hide, not show "0".

13. **Empty states everywhere.** Most lists (Bids, Rankings, Events, Messages) presumably show a blank table when empty. Each needs a dedicated empty state with an illustration/icon, one-line explanation, and a primary action ("Create your first event").

14. **Loading states are bare.** "Loading…" text against blank background feels broken. Use shadcn `Skeleton` matching the actual layout — list pages get row skeletons, profile gets a card skeleton. Cheap and instantly feels more premium.

15. **Toast positioning.** Sonner default is bottom-right; for a workspace app, top-right or top-center reads better and doesn't collide with sidebar tooltips.

16. **Navigation breadcrumbs.** Once a user is 2 clicks deep (e.g., Bids → individual rushee detail), there's no breadcrumb home. Add a simple breadcrumb under the page title.

## 🟢 Mobile

17. **Dashboard sidebar on mobile.** Need to verify the chapter dashboard collapses to a hamburger drawer at <768px. If it's still full-width, the content is unusable on phones — and rushees especially will be on phones.

18. **Tap targets.** `Button size="icon"` is 36×36 by default — bump to `min-h-11 min-w-11` for primary tap targets (notification bell, avatar menu, message send).

## 🟢 Brand consistency

19. **Tighten the type scale.** The hero uses Playfair very large + the gold accent on "simplified" is nice, but inside the app most pages use only DM Sans. Sprinkle one Playfair page title per major section so the brand feel carries past the landing.

20. **Color tokens audit.** Check that no component uses raw `text-gray-*` or `bg-white` — everything should be `text-foreground` / `bg-background` so dark mode (if added later) just works.

---

## Suggested first batch

If you want me to ship the highest-impact subset in one pass:

```
1. Fix hero right side (#1) + add logo (#2) + simplify CTAs (#3, #5)
2. Add legal checkbox to signup (#11)
3. Add empty states + skeleton loaders to dashboard pages (#13, #14)
4. Fix sidebar mobile drawer if broken (#17)
5. Hide zero-count badges (#12)
```

That's a focused 1-shot pass that takes the app from "feels like an MVP" to "feels like a launch." I can also generate proper design directions for the hero specifically if you want to A/B a few looks before I implement.

Want me to go with the first batch, or pick specific items?
