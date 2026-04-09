
CREATE OR REPLACE FUNCTION public.freeze_non_platform_admin()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only act on admin role inserts
  IF NEW.role = 'admin' THEN
    -- Allow if user is the chapter creator
    IF EXISTS (
      SELECT 1 FROM public.chapters
      WHERE id = NEW.chapter_id AND created_by = NEW.user_id
    ) THEN
      RETURN NEW;
    END IF;
    -- Allow if user is a platform admin
    IF EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = NEW.user_id AND role = 'admin'
    ) THEN
      RETURN NEW;
    END IF;
    -- Freeze the account for review
    NEW.status := 'frozen';
  END IF;
  RETURN NEW;
END;
$function$;

-- Also fix the existing broken record: insert the missing admin membership for the chapter creator
INSERT INTO public.chapter_members (chapter_id, user_id, role, status)
SELECT c.id, c.created_by, 'admin', 'approved'
FROM public.chapters c
WHERE NOT EXISTS (
  SELECT 1 FROM public.chapter_members cm
  WHERE cm.chapter_id = c.id AND cm.user_id = c.created_by
);
