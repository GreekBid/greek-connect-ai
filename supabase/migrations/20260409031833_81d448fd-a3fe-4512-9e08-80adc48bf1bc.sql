
CREATE OR REPLACE FUNCTION public.get_chapter_member_profiles(p_chapter_id uuid)
RETURNS TABLE(user_id uuid, full_name text, avatar_url text, college text, email text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.user_id, p.full_name, p.avatar_url, p.college, p.email
  FROM public.profiles p
  INNER JOIN public.chapter_members cm ON cm.user_id = p.user_id
  WHERE cm.chapter_id = p_chapter_id
    AND (
      public.is_chapter_admin(auth.uid(), p_chapter_id)
      OR public.is_admin(auth.uid())
    );
$$;
