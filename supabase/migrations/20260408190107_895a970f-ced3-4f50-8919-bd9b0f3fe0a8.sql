
-- Allow admins to insert admin roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Allow admins to delete roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (is_admin(auth.uid()));

-- Allow admins to read all roles
CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
USING (is_admin(auth.uid()));
