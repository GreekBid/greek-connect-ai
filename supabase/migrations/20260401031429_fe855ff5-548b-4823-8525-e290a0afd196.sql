
-- Rushee favorites table: tracks which chapters a rushee has favorited
CREATE TABLE public.rushee_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rushee_id uuid NOT NULL,
  chapter_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rushee_id, chapter_user_id)
);

ALTER TABLE public.rushee_favorites ENABLE ROW LEVEL SECURITY;

-- Rushees can view their own favorites
CREATE POLICY "Rushees can view own favorites"
ON public.rushee_favorites FOR SELECT TO authenticated
USING (auth.uid() = rushee_id);

-- Chapter can see who favorited them
CREATE POLICY "Chapters can view their favorites"
ON public.rushee_favorites FOR SELECT TO authenticated
USING (
  chapter_user_id = auth.uid()
  OR is_admin(auth.uid())
);

-- Rushees can add favorites
CREATE POLICY "Rushees can add favorites"
ON public.rushee_favorites FOR INSERT TO authenticated
WITH CHECK (auth.uid() = rushee_id);

-- Rushees can remove favorites
CREATE POLICY "Rushees can remove favorites"
ON public.rushee_favorites FOR DELETE TO authenticated
USING (auth.uid() = rushee_id);
