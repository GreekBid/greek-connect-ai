
-- Add gender and org_type columns
ALTER TABLE public.profiles ADD COLUMN gender text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN org_type text DEFAULT '';

-- Update trigger to save gender and org_type from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name, college, gender, org_type)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'rushee'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'college', ''),
    COALESCE(NEW.raw_user_meta_data->>'gender', ''),
    COALESCE(NEW.raw_user_meta_data->>'org_type', '')
  );
  RETURN NEW;
END;
$function$;

-- Helper: get org_type for a user (chapters have fraternity/sorority, rushees derive from gender)
CREATE OR REPLACE FUNCTION public.get_user_org_type(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN role = 'chapter' THEN COALESCE(org_type, '')
    WHEN gender = 'male' THEN 'fraternity'
    WHEN gender = 'female' THEN 'sorority'
    ELSE ''
  END
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;
