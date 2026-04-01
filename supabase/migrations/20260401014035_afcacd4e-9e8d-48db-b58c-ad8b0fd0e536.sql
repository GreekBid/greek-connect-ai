
-- Fix infinite recursion: drop the self-referencing policy
DROP POLICY IF EXISTS "Chapter members can view all profiles" ON public.profiles;

-- Create a security definer function to check chapter role without triggering RLS
CREATE OR REPLACE FUNCTION public.is_chapter_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _user_id AND role = 'chapter'
  )
$$;

-- Re-create the policy using the function
CREATE POLICY "Chapter members can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.is_chapter_member(auth.uid())
    OR public.is_admin(auth.uid())
  );

-- Also fix events/messages policies that reference profiles directly
DROP POLICY IF EXISTS "Chapter members can create events" ON public.events;
CREATE POLICY "Chapter members can create events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.is_chapter_member(auth.uid()));

DROP POLICY IF EXISTS "Chapter members can update events" ON public.events;
CREATE POLICY "Chapter members can update events" ON public.events FOR UPDATE TO authenticated
  USING (public.is_chapter_member(auth.uid()));

DROP POLICY IF EXISTS "Chapter members can delete events" ON public.events;
CREATE POLICY "Chapter members can delete events" ON public.events FOR DELETE TO authenticated
  USING (public.is_chapter_member(auth.uid()));

DROP POLICY IF EXISTS "Chapter members can send messages" ON public.messages;
CREATE POLICY "Chapter members can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (public.is_chapter_member(auth.uid()));

-- Bids table
CREATE TABLE public.bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rushee_id uuid NOT NULL,
  chapter_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'under_review',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapter members can view all bids" ON public.bids FOR SELECT TO authenticated
  USING (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Chapter members can create bids" ON public.bids FOR INSERT TO authenticated
  WITH CHECK (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Chapter members can update bids" ON public.bids FOR UPDATE TO authenticated
  USING (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Chapter members can delete bids" ON public.bids FOR DELETE TO authenticated
  USING (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Rushees can view own bids" ON public.bids FOR SELECT TO authenticated
  USING (auth.uid() = rushee_id);
