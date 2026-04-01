
-- Add reply_to column to direct_messages for threading
ALTER TABLE public.direct_messages ADD COLUMN reply_to uuid REFERENCES public.direct_messages(id) ON DELETE CASCADE;

-- Allow rushees to send replies (insert into direct_messages where reply_to is not null)
CREATE POLICY "Rushees can reply to messages" ON public.direct_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id 
    AND reply_to IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.direct_message_recipients 
      WHERE message_id = reply_to AND recipient_id = auth.uid()
    )
  );

-- Allow rushees to view messages they sent as replies
CREATE POLICY "Users can view own sent messages" ON public.direct_messages FOR SELECT TO authenticated
  USING (sender_id = auth.uid());
