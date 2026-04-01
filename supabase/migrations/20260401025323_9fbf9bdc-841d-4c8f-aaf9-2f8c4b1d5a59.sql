
-- Helper: get a user's college
CREATE OR REPLACE FUNCTION public.get_user_college(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(college, '') FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- ====== PROFILES ======
-- Drop old broad policy
DROP POLICY IF EXISTS "Chapter members can view all profiles" ON public.profiles;

-- Same-college visibility (both directions): users see own profile + same-college profiles (if college is set)
CREATE POLICY "Users can view same college profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR is_admin(auth.uid())
  OR (
    get_user_college(auth.uid()) <> ''
    AND college <> ''
    AND get_user_college(auth.uid()) = college
  )
);

-- Drop old "Users can read own profile" since the new policy covers it
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

-- ====== MESSAGES (broadcasts) ======
DROP POLICY IF EXISTS "Anyone can read messages" ON public.messages;

CREATE POLICY "Same college can read messages"
ON public.messages FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    get_user_college(auth.uid()) <> ''
    AND get_user_college(author_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(author_id)
  )
);

-- ====== EVENTS ======
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;

CREATE POLICY "Same college can view events"
ON public.events FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    get_user_college(auth.uid()) <> ''
    AND get_user_college(created_by) <> ''
    AND get_user_college(auth.uid()) = get_user_college(created_by)
  )
);

-- ====== EVENT RSVPs ======
DROP POLICY IF EXISTS "Anyone can view rsvps" ON public.event_rsvps;

CREATE POLICY "Same college can view rsvps"
ON public.event_rsvps FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    get_user_college(auth.uid()) <> ''
    AND get_user_college(user_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(user_id)
  )
);

-- ====== BIDS ======
-- Chapter viewing bids: restrict to same college rushees
DROP POLICY IF EXISTS "Chapter members can view all bids" ON public.bids;

CREATE POLICY "Chapter members can view same college bids"
ON public.bids FOR SELECT TO authenticated
USING (
  auth.uid() = rushee_id
  OR is_admin(auth.uid())
  OR (
    (is_chapter_member(auth.uid()) OR is_admin(auth.uid()))
    AND get_user_college(auth.uid()) <> ''
    AND get_user_college(rushee_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(rushee_id)
  )
);

-- Keep rushee own bids policy
DROP POLICY IF EXISTS "Rushees can view own bids" ON public.bids;

CREATE POLICY "Rushees can view own bids"
ON public.bids FOR SELECT TO authenticated
USING (auth.uid() = rushee_id);

-- ====== RANKINGS ======
DROP POLICY IF EXISTS "Chapter can view rankings" ON public.rankings;

CREATE POLICY "Chapter can view same college rankings"
ON public.rankings FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    (is_chapter_member(auth.uid()) OR is_admin(auth.uid()))
    AND get_user_college(auth.uid()) <> ''
    AND get_user_college(rushee_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(rushee_id)
  )
);

-- ====== STARS ======
DROP POLICY IF EXISTS "Chapter can view stars" ON public.stars;

CREATE POLICY "Chapter can view same college stars"
ON public.stars FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    (is_chapter_member(auth.uid()) OR is_admin(auth.uid()))
    AND get_user_college(auth.uid()) <> ''
    AND get_user_college(rushee_id) <> ''
    AND get_user_college(auth.uid()) = get_user_college(rushee_id)
  )
);
