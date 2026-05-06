
-- 1) BIDS: enforce ownership ============================================
DROP POLICY IF EXISTS "Chapter members can create bids" ON public.bids;
DROP POLICY IF EXISTS "Chapter members can update bids" ON public.bids;
DROP POLICY IF EXISTS "Chapter members can delete bids" ON public.bids;

CREATE POLICY "Chapter members can create bids"
  ON public.bids FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = chapter_user_id
    AND (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()))
  );

CREATE POLICY "Chapter members can update own bids"
  ON public.bids FOR UPDATE TO authenticated
  USING (auth.uid() = chapter_user_id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = chapter_user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Chapter members can delete own bids"
  ON public.bids FOR DELETE TO authenticated
  USING (auth.uid() = chapter_user_id OR public.is_admin(auth.uid()));

-- 2) PROFILES: hide email from peers =====================================
-- Remove email column from default authenticated SELECT.
REVOKE SELECT (email) ON public.profiles FROM authenticated, anon;

-- Helper: fetch email only for self, platform admins, or chapter admins of the same chapter
CREATE OR REPLACE FUNCTION public.get_profile_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.email
  FROM public.profiles p
  WHERE p.user_id = _user_id
    AND (
      auth.uid() = _user_id
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.chapter_members cm
        WHERE cm.user_id = _user_id
          AND public.is_chapter_admin(auth.uid(), cm.chapter_id)
      )
    )
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.get_profile_email(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profile_email(uuid) TO authenticated;

-- 3) PROFILES: prevent self role escalation ==============================
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin(auth.uid()) THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_role_change_trg ON public.profiles;
CREATE TRIGGER prevent_role_change_trg
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- 4) RANKINGS: privacy — only see own votes ==============================
DROP POLICY IF EXISTS "Chapter can view matching rankings" ON public.rankings;

CREATE POLICY "Members can view own vote"
  ON public.rankings FOR SELECT TO authenticated
  USING (auth.uid() = voter_id OR public.is_admin(auth.uid()));

-- Aggregate counts per rushee, filtered by caller's college/org
CREATE OR REPLACE FUNCTION public.get_rushee_ranking_counts()
RETURNS TABLE(rushee_id uuid, yes_count int, maybe_count int, no_count int)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.rushee_id,
    COUNT(*) FILTER (WHERE r.vote = 'yes')::int   AS yes_count,
    COUNT(*) FILTER (WHERE r.vote = 'maybe')::int AS maybe_count,
    COUNT(*) FILTER (WHERE r.vote = 'no')::int    AS no_count
  FROM public.rankings r
  WHERE
    public.is_admin(auth.uid())
    OR (
      (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()))
      AND public.get_user_college(auth.uid()) <> ''
      AND public.get_user_college(r.rushee_id) <> ''
      AND public.get_user_college(auth.uid()) = public.get_user_college(r.rushee_id)
      AND public.get_user_org_type(auth.uid()) <> ''
      AND public.get_user_org_type(r.rushee_id) <> ''
      AND public.get_user_org_type(auth.uid()) = public.get_user_org_type(r.rushee_id)
    )
  GROUP BY r.rushee_id
$$;

REVOKE EXECUTE ON FUNCTION public.get_rushee_ranking_counts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_rushee_ranking_counts() TO authenticated;
