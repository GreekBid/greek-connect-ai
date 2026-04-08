-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Allow admins to delete chapters
CREATE POLICY "Admins can delete chapters"
ON public.chapters
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Allow admins to delete chapter members (cascade cleanup)
CREATE POLICY "Admins can delete chapter members"
ON public.chapter_members
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));
