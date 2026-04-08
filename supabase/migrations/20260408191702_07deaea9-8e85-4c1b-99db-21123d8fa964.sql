
-- 1. Fix the RLS policy: only chapter creators can self-add as admin
DROP POLICY IF EXISTS "Chapter creators can add self as admin" ON public.chapter_members;

CREATE POLICY "Chapter creators can add self as admin"
ON public.chapter_members FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'admin'
  AND status = 'approved'
  AND EXISTS (
    SELECT 1 FROM public.chapters
    WHERE id = chapter_id
    AND created_by = auth.uid()
  )
);

-- 2. Trigger to freeze non-platform-admin chapter admins
CREATE OR REPLACE FUNCTION public.freeze_non_platform_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act on admin role inserts
  IF NEW.role = 'admin' THEN
    -- Check if user is a platform admin
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = NEW.user_id AND role = 'admin'
    ) THEN
      -- Freeze the account for review
      NEW.status := 'frozen';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_freeze_non_platform_admin
BEFORE INSERT ON public.chapter_members
FOR EACH ROW
EXECUTE FUNCTION public.freeze_non_platform_admin();
