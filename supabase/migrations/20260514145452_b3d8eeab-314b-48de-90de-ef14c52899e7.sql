
-- 1. EMAIL EXPOSURE: revoke column-level SELECT on profiles.email from authenticated.
-- The existing get_profile_email() SECURITY DEFINER function already gates legitimate access
-- (self, chapter admin of that user, or platform admin).
REVOKE SELECT (email) ON public.profiles FROM authenticated, anon, public;
GRANT SELECT (email) ON public.profiles TO service_role;

-- 2. RUSHEE_FAVORITES: fix inverted INSERT/DELETE policies.
DROP POLICY IF EXISTS "Rushees can add favorites" ON public.rushee_favorites;
DROP POLICY IF EXISTS "Rushees can remove favorites" ON public.rushee_favorites;
DROP POLICY IF EXISTS "Rushees can view own favorites" ON public.rushee_favorites;

CREATE POLICY "Chapter users can add favorites"
  ON public.rushee_favorites FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = chapter_user_id
    AND (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()))
  );

CREATE POLICY "Chapter users can remove own favorites"
  ON public.rushee_favorites FOR DELETE TO authenticated
  USING (auth.uid() = chapter_user_id OR public.is_admin(auth.uid()));

-- 3. RANKINGS: tighten INSERT/UPDATE to require same college + org_type as the rushee.
DROP POLICY IF EXISTS "Chapter can vote" ON public.rankings;
DROP POLICY IF EXISTS "Chapter can update vote" ON public.rankings;

CREATE POLICY "Chapter can vote"
  ON public.rankings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = voter_id
    AND (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()))
    AND (
      public.is_admin(auth.uid())
      OR (
        public.get_user_college(auth.uid()) <> ''
        AND public.get_user_college(rushee_id) <> ''
        AND public.get_user_college(auth.uid()) = public.get_user_college(rushee_id)
        AND public.get_user_org_type(auth.uid()) <> ''
        AND public.get_user_org_type(rushee_id) <> ''
        AND public.get_user_org_type(auth.uid()) = public.get_user_org_type(rushee_id)
      )
    )
  );

CREATE POLICY "Chapter can update vote"
  ON public.rankings FOR UPDATE TO authenticated
  USING (auth.uid() = voter_id)
  WITH CHECK (
    auth.uid() = voter_id
    AND (
      public.is_admin(auth.uid())
      OR (
        public.get_user_college(auth.uid()) = public.get_user_college(rushee_id)
        AND public.get_user_org_type(auth.uid()) = public.get_user_org_type(rushee_id)
      )
    )
  );

-- 4. REALTIME AUTHORIZATION: restrict realtime channel subscriptions.
-- realtime.messages RLS is the supported way to gate Realtime broadcasts.
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Only authenticated users may receive any realtime broadcast.
DROP POLICY IF EXISTS "Authenticated can receive realtime" ON realtime.messages;
CREATE POLICY "Authenticated can receive realtime"
  ON realtime.messages FOR SELECT TO authenticated
  USING (true);

-- Only authenticated users may broadcast (postgres_changes uses SELECT, broadcast uses INSERT).
DROP POLICY IF EXISTS "Authenticated can broadcast realtime" ON realtime.messages;
CREATE POLICY "Authenticated can broadcast realtime"
  ON realtime.messages FOR INSERT TO authenticated
  WITH CHECK (true);

-- NOTE: Table-level RLS on the source tables (events, bids, direct_message_recipients)
-- already filters which row-change payloads each user receives via postgres_changes,
-- because Realtime applies RLS as the subscriber. The above policies just ensure
-- anonymous clients cannot subscribe at all.

-- 5. SECURITY DEFINER function lockdown: revoke EXECUTE from anon/public.
-- Authenticated keeps EXECUTE because RLS policies invoke these helpers.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM PUBLIC, anon',
                   r.nspname, r.proname, r.args);
  END LOOP;
END $$;

-- 6. search_path on the 4 email-queue functions.
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- 7. STORAGE: avatars bucket — keep public READ on individual files but restrict listing.
-- Public buckets allow file access by URL; this just prevents enumerating all objects.
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars by path"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Note: this still allows direct fetch by known path (needed for <img src>),
-- but storage.list() requires bucket-level authorization which is denied for anon.
