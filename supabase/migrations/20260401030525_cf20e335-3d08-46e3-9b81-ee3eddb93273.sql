
-- ====== PROFILES ======
-- Replace the college-only policy with college + org_type matching
DROP POLICY IF EXISTS "Users can view same college profiles" ON public.profiles;

CREATE POLICY "Users can view matching profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR is_admin(auth.uid())
  OR (
    get_user_college(auth.uid()) <> ''
    AND college <> ''
    AND get_user_college(auth.uid()) = college
    AND get_user_org_type(auth.uid()) <> ''
    AND get_user_org_type(user_id) <> ''
    AND get_user_org_type(auth.uid()) = get_user_org_type(user_id)
  )
);

-- ====== MESSAGES (broadcasts) ======
DROP POLICY IF EXISTS "Same college can read messages" ON public.messages;

CREATE POLICY "Matching college and org can read messages"
ON public.messages FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    get_user_college(auth.uid()) <> ''
    AND get_user_college(author_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(author_id)
    AND get_user_org_type(auth.uid()) <> ''
    AND get_user_org_type(author_id) <> ''
    AND get_user_org_type(auth.uid()) = get_user_org_type(author_id)
  )
);

-- ====== EVENTS ======
DROP POLICY IF EXISTS "Same college can view events" ON public.events;

CREATE POLICY "Matching college and org can view events"
ON public.events FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    get_user_college(auth.uid()) <> ''
    AND get_user_college(created_by) <> ''
    AND get_user_college(auth.uid()) = get_user_college(created_by)
    AND get_user_org_type(auth.uid()) <> ''
    AND get_user_org_type(created_by) <> ''
    AND get_user_org_type(auth.uid()) = get_user_org_type(created_by)
  )
);

-- ====== EVENT RSVPs ======
DROP POLICY IF EXISTS "Same college can view rsvps" ON public.event_rsvps;

CREATE POLICY "Matching college and org can view rsvps"
ON public.event_rsvps FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR auth.uid() = user_id
  OR (
    get_user_college(auth.uid()) <> ''
    AND get_user_college(user_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(user_id)
    AND get_user_org_type(auth.uid()) <> ''
    AND get_user_org_type(user_id) <> ''
    AND get_user_org_type(auth.uid()) = get_user_org_type(user_id)
  )
);

-- ====== BIDS ======
DROP POLICY IF EXISTS "Chapter members can view same college bids" ON public.bids;

CREATE POLICY "Chapter members can view matching bids"
ON public.bids FOR SELECT TO authenticated
USING (
  auth.uid() = rushee_id
  OR is_admin(auth.uid())
  OR (
    (is_chapter_member(auth.uid()) OR is_admin(auth.uid()))
    AND get_user_college(auth.uid()) <> ''
    AND get_user_college(rushee_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(rushee_id)
    AND get_user_org_type(auth.uid()) <> ''
    AND get_user_org_type(rushee_id) <> ''
    AND get_user_org_type(auth.uid()) = get_user_org_type(rushee_id)
  )
);

-- ====== RANKINGS ======
DROP POLICY IF EXISTS "Chapter can view same college rankings" ON public.rankings;

CREATE POLICY "Chapter can view matching rankings"
ON public.rankings FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    (is_chapter_member(auth.uid()) OR is_admin(auth.uid()))
    AND get_user_college(auth.uid()) <> ''
    AND get_user_college(rushee_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(rushee_id)
    AND get_user_org_type(auth.uid()) <> ''
    AND get_user_org_type(rushee_id) <> ''
    AND get_user_org_type(auth.uid()) = get_user_org_type(rushee_id)
  )
);

-- ====== STARS ======
DROP POLICY IF EXISTS "Chapter can view same college stars" ON public.stars;

CREATE POLICY "Chapter can view matching stars"
ON public.stars FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    (is_chapter_member(auth.uid()) OR is_admin(auth.uid()))
    AND get_user_college(auth.uid()) <> ''
    AND get_user_college(rushee_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(rushee_id)
    AND get_user_org_type(auth.uid()) <> ''
    AND get_user_org_type(rushee_id) <> ''
    AND get_user_org_type(auth.uid()) = get_user_org_type(rushee_id)
  )
);
