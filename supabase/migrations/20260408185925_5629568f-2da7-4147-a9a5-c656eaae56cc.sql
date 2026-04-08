
-- Add is_test column to profiles
ALTER TABLE public.profiles ADD COLUMN is_test boolean NOT NULL DEFAULT false;

-- Helper function to check if a user is a test profile
CREATE OR REPLACE FUNCTION public.get_user_is_test(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(is_test, false) FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Drop and recreate the profiles SELECT policy to include is_test filtering
DROP POLICY IF EXISTS "Users can view matching profiles" ON public.profiles;

CREATE POLICY "Users can view matching profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = user_id)
  OR is_admin(auth.uid())
  OR (
    (get_user_college(auth.uid()) <> ''::text)
    AND (college <> ''::text)
    AND (get_user_college(auth.uid()) = college)
    AND (get_user_org_type(auth.uid()) <> ''::text)
    AND (get_user_org_type(user_id) <> ''::text)
    AND (get_user_org_type(auth.uid()) = get_user_org_type(user_id))
    AND (get_user_is_test(auth.uid()) = is_test)
  )
);

-- Allow admins to update any profile's is_test flag
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (is_admin(auth.uid()));
