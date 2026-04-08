
-- 1. Fix profile role escalation: add WITH CHECK to prevent role changes
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 2. Fix cross-org event modification: scope UPDATE/DELETE to same college+org_type
DROP POLICY IF EXISTS "Chapter members can update events" ON public.events;

CREATE POLICY "Chapter members can update events"
ON public.events FOR UPDATE TO authenticated
USING (
  is_chapter_member(auth.uid())
  AND get_user_college(auth.uid()) = get_user_college(created_by)
  AND get_user_org_type(auth.uid()) = get_user_org_type(created_by)
);

DROP POLICY IF EXISTS "Chapter members can delete events" ON public.events;

CREATE POLICY "Chapter members can delete events"
ON public.events FOR DELETE TO authenticated
USING (
  is_chapter_member(auth.uid())
  AND get_user_college(auth.uid()) = get_user_college(created_by)
  AND get_user_org_type(auth.uid()) = get_user_org_type(created_by)
);

-- 3. Fix messages author spoofing: require author_id = auth.uid()
DROP POLICY IF EXISTS "Chapter members can send messages" ON public.messages;

CREATE POLICY "Chapter members can send messages"
ON public.messages FOR INSERT TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND is_chapter_member(auth.uid())
);

-- 4. Add avatar delete policy scoped to own folder
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
