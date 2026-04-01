
-- Events table
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL,
  time text NOT NULL,
  location text NOT NULL DEFAULT '',
  capacity int DEFAULT 50,
  vibe text DEFAULT 'Casual',
  attire text DEFAULT 'Casual',
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view events
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT TO authenticated USING (true);
-- Only chapter members can create/update/delete events
CREATE POLICY "Chapter members can create events" ON public.events FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'chapter'));
CREATE POLICY "Chapter members can update events" ON public.events FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'chapter'));
CREATE POLICY "Chapter members can delete events" ON public.events FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'chapter'));

-- Event RSVPs table
CREATE TABLE public.event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rsvps" ON public.event_rsvps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can rsvp" ON public.event_rsvps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own rsvp" ON public.event_rsvps FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages table (broadcasts from chapter to rushees)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'broadcast',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read messages
CREATE POLICY "Anyone can read messages" ON public.messages FOR SELECT TO authenticated USING (true);
-- Only chapter members can create messages
CREATE POLICY "Chapter members can send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'chapter'));

-- Allow admins full access via is_admin function
CREATE POLICY "Admins can manage events" ON public.events FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage messages" ON public.messages FOR ALL TO authenticated USING (public.is_admin(auth.uid()));
