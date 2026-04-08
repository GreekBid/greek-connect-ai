
DROP POLICY IF EXISTS "Chapter can view all recipients" ON public.direct_message_recipients;

CREATE POLICY "Chapter can view own chapter recipients"
ON public.direct_message_recipients
FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR (
    EXISTS (
      SELECT 1 FROM public.direct_messages dm
      WHERE dm.id = message_id
        AND get_user_college(dm.sender_id) = get_user_college(auth.uid())
        AND get_user_org_type(dm.sender_id) = get_user_org_type(auth.uid())
        AND get_user_college(auth.uid()) <> ''
        AND get_user_org_type(auth.uid()) <> ''
    )
    AND is_chapter_member(auth.uid())
  )
);
