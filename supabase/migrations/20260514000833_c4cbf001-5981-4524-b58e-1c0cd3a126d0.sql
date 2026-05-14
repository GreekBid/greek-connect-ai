
-- Tighten INSERT policy: clients can only insert their own profile with role='rushee'.
-- Chapter profiles are created by handle_new_user (SECURITY DEFINER) which bypasses RLS.
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'rushee'::app_role);

-- Wire up the existing prevent_role_change function as a BEFORE UPDATE trigger
DROP TRIGGER IF EXISTS prevent_role_change_trigger ON public.profiles;
CREATE TRIGGER prevent_role_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_change();
