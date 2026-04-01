
CREATE OR REPLACE FUNCTION public.prevent_gender_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.gender IS NOT NULL AND OLD.gender <> '' AND NEW.gender <> OLD.gender THEN
    NEW.gender := OLD.gender;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_gender_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_gender_change();
