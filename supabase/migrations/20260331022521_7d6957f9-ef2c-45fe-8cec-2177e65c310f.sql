
CREATE TABLE public.rush_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('rushee', 'chapter')),
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rush_notes ENABLE ROW LEVEL SECURITY;

-- Authors can CRUD their own notes
CREATE POLICY "Users can read own notes"
  ON public.rush_notes FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert own notes"
  ON public.rush_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own notes"
  ON public.rush_notes FOR UPDATE TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own notes"
  ON public.rush_notes FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- Index for fast lookups
CREATE INDEX idx_rush_notes_author ON public.rush_notes(author_id);
CREATE INDEX idx_rush_notes_subject ON public.rush_notes(subject_id, subject_type);
