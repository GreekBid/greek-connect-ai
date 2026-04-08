
DROP POLICY IF EXISTS "Chapter can view sent messages" ON public.direct_messages;

CREATE POLICY "Chapter can view sent messages"
ON public.direct_messages
FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid())
  OR (sender_id = auth.uid())
);
