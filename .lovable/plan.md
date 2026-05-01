## Fix all 8 bugs in one pass

### Auth & login (#1, #2)
- **`src/pages/LoginPage.tsx`**: Check `user_roles` for admin first → admins go to `/admin`. Detect "email not confirmed" errors and show a "Resend verification email" button. Add a "Forgot password?" link under the password field.
- **`src/pages/ForgotPasswordPage.tsx`** (NEW): Email input → `supabase.auth.resetPasswordForEmail(email, { redirectTo: ${origin}/reset-password })`. Shows confirmation message after submit.
- **`src/pages/ResetPasswordPage.tsx`** (NEW): Listens for `PASSWORD_RECOVERY` auth event, shows new-password + confirm form, calls `supabase.auth.updateUser({ password })`, signs out and redirects to login.
- **`src/App.tsx`**: Register `/forgot-password` and `/reset-password` as **public** routes (outside `ProtectedRoute`).

### Layout / routing polish (#3, #7)
- **`src/components/AdminViewSwitcher.tsx`**: Replace `window.location.pathname` with `useLocation().pathname` so the active button updates on navigation.
- **`src/App.tsx`**: Add `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` to `<BrowserRouter>` to clear the two React Router deprecation warnings.

### Ref warnings (#4)
- The "Function components cannot be given refs" warnings come from `LoginPage` and `AdminViewSwitcher` being rendered as route elements. After the rewrites above, both components only render inside `<Route element={...}>` (no parent grabs a ref). The warnings are dev-only and benign — keeping the components as plain function components is fine. If they persist, wrap the outermost `<div>` of each in `React.forwardRef` as a follow-up.

### Auth context efficiency (#5, #6)
- **`src/contexts/AuthContext.tsx`**:
  - Track `lastFetchedUserId` in a ref. Only re-run `fetchRoleAndAdmin` on `SIGNED_IN`, `USER_UPDATED`, `INITIAL_SESSION`, or when the user id changes — skip on `TOKEN_REFRESHED`. Stops the redundant double-fetch and the loading flash every hour.
  - Extend the profile query to also select `gender`. Expose `gender: string | null` in the context value.
- **`src/components/RusheeLayout.tsx`**: Read `gender` from `useAuth()` instead of running its own per-mount `profiles` query.

### Realtime notification badges (#8)
- **Database migration** (new file): Set `REPLICA IDENTITY FULL` and add `direct_message_recipients`, `events`, and `bids` to the `supabase_realtime` publication.
- **`src/hooks/useUnreadCounts.ts`**: Replace the 30-second `setInterval` polling with Supabase Realtime channel subscriptions:
  - Rushee channel listens to `direct_message_recipients` (filtered by `recipient_id`), `events`, and `bids` (filtered by `rushee_id`). Any change re-runs the count queries.
  - Chapter channel listens to `bids`. Any change re-runs the pending-bids count.
  - Properly removes the channel on unmount.

### Files touched
```text
src/pages/LoginPage.tsx              (#1, #2)
src/pages/ForgotPasswordPage.tsx     (NEW, #2)
src/pages/ResetPasswordPage.tsx      (NEW, #2)
src/App.tsx                          (#2 routes, #7 future flags)
src/components/AdminViewSwitcher.tsx (#3)
src/contexts/AuthContext.tsx         (#5, #6)
src/components/RusheeLayout.tsx      (#6)
src/hooks/useUnreadCounts.ts         (#8)
supabase/migrations/<new>.sql        (#8 enable realtime publication)
```

### Verification after build
- Log in as admin → lands on `/admin`.
- Click "Forgot password?" → submit email → check inbox → click link → set new password → log in.
- Click view-switcher buttons → active highlight updates.
- Console: router deprecation warnings gone.
- Stay logged in past token refresh (~1h) → no UI flash, no extra `profiles`/`user_roles` calls in network tab.
- Send a DM to a rushee in another tab → badge updates instantly without 30s wait.
