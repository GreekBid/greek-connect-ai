
CREATE POLICY "Rushees can view messages sent to them"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.direct_message_recipients
    WHERE direct_message_recipients.message_id = direct_messages.id
    AND direct_message_recipients.recipient_id = auth.uid()
  )
);
