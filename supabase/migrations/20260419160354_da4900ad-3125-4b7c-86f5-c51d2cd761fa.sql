DO $$
DECLARE
  v_user_id uuid := '0376006e-7966-454c-b863-59b690c9ba29';
BEGIN
  DELETE FROM public.chapter_members WHERE user_id = v_user_id;
  DELETE FROM public.event_rsvps WHERE user_id = v_user_id;
  DELETE FROM public.rush_notes WHERE author_id = v_user_id;
  DELETE FROM public.rushee_favorites WHERE rushee_id = v_user_id OR chapter_user_id = v_user_id;
  DELETE FROM public.stars WHERE starred_by = v_user_id OR rushee_id = v_user_id;
  DELETE FROM public.rankings WHERE voter_id = v_user_id OR rushee_id = v_user_id;
  DELETE FROM public.bids WHERE chapter_user_id = v_user_id OR rushee_id = v_user_id;
  DELETE FROM public.direct_message_recipients WHERE recipient_id = v_user_id;
  DELETE FROM public.direct_messages WHERE sender_id = v_user_id;
  DELETE FROM public.messages WHERE author_id = v_user_id;
  DELETE FROM public.events WHERE created_by = v_user_id;
  DELETE FROM public.chapters WHERE created_by = v_user_id;
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  DELETE FROM public.profiles WHERE user_id = v_user_id;
  DELETE FROM auth.users WHERE id = v_user_id;
END $$;