
-- Rankings / votes table
CREATE TABLE public.rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rushee_id uuid NOT NULL,
  voter_id uuid NOT NULL,
  vote text NOT NULL DEFAULT 'maybe',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rushee_id, voter_id)
);

ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapter can view rankings" ON public.rankings FOR SELECT TO authenticated
  USING (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Chapter can vote" ON public.rankings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = voter_id AND (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid())));
CREATE POLICY "Chapter can update vote" ON public.rankings FOR UPDATE TO authenticated
  USING (auth.uid() = voter_id);
CREATE POLICY "Chapter can delete vote" ON public.rankings FOR DELETE TO authenticated
  USING (auth.uid() = voter_id);

-- Stars / favorites table
CREATE TABLE public.stars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rushee_id uuid NOT NULL,
  starred_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(rushee_id, starred_by)
);

ALTER TABLE public.stars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapter can view stars" ON public.stars FOR SELECT TO authenticated
  USING (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Chapter can star" ON public.stars FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = starred_by AND (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid())));
CREATE POLICY "Chapter can unstar" ON public.stars FOR DELETE TO authenticated
  USING (auth.uid() = starred_by);
