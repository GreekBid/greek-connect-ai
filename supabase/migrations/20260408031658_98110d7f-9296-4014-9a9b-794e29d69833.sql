
-- 1. Fix profile role escalation: replace UPDATE policy with one that prevents role changes
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid()));

-- 2. Fix cross-org event modification
DROP POLICY IF EXISTS "Chapter members can update events" ON public.events;
CREATE POLICY "Chapter members can update events"
ON public.events
FOR UPDATE
USING (
  is_chapter_member(auth.uid())
  AND get_user_college(auth.uid()) = get_user_college(created_by)
  AND get_user_org_type(auth.uid()) = get_user_org_type(created_by)
);

DROP POLICY IF EXISTS "Chapter members can delete events" ON public.events;
CREATE POLICY "Chapter members can delete events"
ON public.events
FOR DELETE
USING (
  is_chapter_member(auth.uid())
  AND get_user_college(auth.uid()) = get_user_college(created_by)
  AND get_user_org_type(auth.uid()) = get_user_org_type(created_by)
);

DROP POLICY IF EXISTS "Chapter members can create events" ON public.events;
CREATE POLICY "Chapter members can create events"
ON public.events
FOR INSERT
WITH CHECK (
  is_chapter_member(auth.uid())
  AND get_user_college(auth.uid()) <> ''
  AND get_user_org_type(auth.uid()) <> ''
);
