
-- Direct messages table
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'direct',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapter can view sent messages" ON public.direct_messages FOR SELECT TO authenticated
  USING (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()) OR sender_id = auth.uid());
CREATE POLICY "Chapter can send messages" ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));

-- Recipients junction table
CREATE TABLE public.direct_message_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_message_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapter can view all recipients" ON public.direct_message_recipients FOR SELECT TO authenticated
  USING (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Rushees can view own messages" ON public.direct_message_recipients FOR SELECT TO authenticated
  USING (recipient_id = auth.uid());
CREATE POLICY "Chapter can add recipients" ON public.direct_message_recipients FOR INSERT TO authenticated
  WITH CHECK (public.is_chapter_member(auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "Rushees can mark as read" ON public.direct_message_recipients FOR UPDATE TO authenticated
  USING (recipient_id = auth.uid());
