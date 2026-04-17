

The user is still unable to log in. Since we ruled out the preview-proxy theory in approval but the issue persists, I need to actually investigate before guessing again.

Hypotheses to check:
1. Auth service health — auth logs show GoTrue restarted at 14:16 today, which is normal but worth confirming it's running.
2. The user (austin) may not actually have an account in `auth.users` with the email/password he's trying.
3. Email confirmation may be blocking — though memory says auto-confirm is enabled.
4. Network/CORS from the published domain (greekbid.com) — different from preview.

Without knowing WHERE he tested (preview vs greekbid.com vs published lovable URL) and WHAT exact error he sees now, I'm guessing. Last he said "Failed to fetch" on the login page — that was in the preview. He hasn't confirmed he tried the published URL.

Plan:

## Step 1 — Find out exactly what's happening now

Ask 3 quick questions:
- Which URL did you try (greekbid.com, the lovable.app URL, or the preview)?
- What's the exact error message now (is it still "Failed to fetch", or something different like "Invalid login credentials")?
- What email are you trying to log in with?

## Step 2 — Based on the answer, take one of these paths

**Path A — "Failed to fetch" on greekbid.com / published URL:**
This would be a real bug, not a preview issue. Check:
- Browser console network tab for the failing request URL
- Whether Supabase auth endpoint is reachable from that domain
- CORS / Site URL config in auth settings

**Path B — "Invalid login credentials":**
Account doesn't exist or password is wrong. Check `auth.users` for the email via DB query. If account exists, offer password reset (which requires building a `/reset-password` page — not currently in the codebase).

**Path C — "Email not confirmed":**
Memory says auto-confirm is on, but verify in auth config. If somehow disabled, re-enable or manually confirm the user.

**Path D — Still preview-only:**
Re-confirm: production works, preview doesn't, use production.

## Step 3 — If password reset is needed

Currently there's no `/reset-password` route or "Forgot password" link in `LoginPage.tsx`. If the account exists but password is forgotten, build:
- "Forgot password?" link on login page
- New `ForgotPasswordPage.tsx` calling `supabase.auth.resetPasswordForEmail`
- New `ResetPasswordPage.tsx` at `/reset-password` calling `supabase.auth.updateUser`
- Add both routes to `App.tsx`

I'll ask the clarifying questions first rather than guessing and building the wrong fix.

