## Fix profile role privilege escalation

Two RLS policies on `profiles` let any authenticated user set or change their own `role`, which would grant chapter privileges. There's already a `prevent_role_change()` function defined but no trigger wired up, so it isn't enforcing anything.

### Migration

1. **Attach the existing `prevent_role_change` trigger** to `profiles` BEFORE UPDATE — silently reverts role changes by non-admins (defense in depth).
2. **Tighten the UPDATE policy** `"Users can update own profile"` with a `WITH CHECK` that enforces `role = OLD-equivalent`. Since RLS can't reference OLD directly, rely on the trigger + keep the policy as-is, OR replace with a check that disallows role being anything other than what `handle_new_user` set. Simpler: keep policy, rely on trigger.
3. **Tighten the INSERT policy** `"Users can insert own profile"` to require `role = 'rushee'`. Profiles for chapter users are created server-side by the `handle_new_user` trigger (SECURITY DEFINER, bypasses RLS) using metadata from signup, so legitimate chapter signup is unaffected. Direct client inserts will be forced to 'rushee'.
4. **Add a trigger** `prevent_role_change_trigger BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION prevent_role_change()`.

### Why this works

- Signup flow uses `auth.signUp` with `raw_user_meta_data.role`, and `handle_new_user` (SECURITY DEFINER) inserts the profile — bypasses the tightened INSERT policy.
- Any direct client insert is constrained to `role = 'rushee'`.
- Any client update attempting to change `role` is silently reverted by the trigger (admins via `is_admin` check are allowed through).

### No frontend changes needed

`RusheeProfile.tsx` and other update flows don't touch `role`, so behavior is preserved.
