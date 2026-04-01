
-- Chapter members can view all profiles
CREATE POLICY "Chapter members can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = auth.uid() AND p.role = 'chapter')
    OR public.is_admin(auth.uid())
  );
