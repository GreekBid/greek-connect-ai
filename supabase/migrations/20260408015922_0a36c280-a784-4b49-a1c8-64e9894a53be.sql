
-- Create chapters table
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  college TEXT NOT NULL,
  org_type TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(name, college)
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Anyone at same college + org_type can view chapters
CREATE POLICY "Users can view matching chapters"
  ON public.chapters FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid())
    OR (
      get_user_college(auth.uid()) <> '' AND college <> ''
      AND get_user_college(auth.uid()) = college
      AND get_user_org_type(auth.uid()) <> '' AND org_type <> ''
      AND get_user_org_type(auth.uid()) = org_type
    )
  );

-- Chapter creators can insert
CREATE POLICY "Users can create chapters"
  ON public.chapters FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Chapter admin can update their chapter
CREATE POLICY "Admin can update own chapter"
  ON public.chapters FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create chapter_members table
CREATE TABLE public.chapter_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, user_id)
);

ALTER TABLE public.chapter_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is chapter admin
CREATE OR REPLACE FUNCTION public.is_chapter_admin(_user_id uuid, _chapter_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chapter_members
    WHERE user_id = _user_id
      AND chapter_id = _chapter_id
      AND role = 'admin'
      AND status = 'approved'
  )
$$;

-- Members can view own membership
CREATE POLICY "Users can view own membership"
  ON public.chapter_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Chapter admins can view all members of their chapter
CREATE POLICY "Chapter admins can view members"
  ON public.chapter_members FOR SELECT
  TO authenticated
  USING (
    is_chapter_admin(auth.uid(), chapter_id)
    OR is_admin(auth.uid())
  );

-- Users can request to join (insert pending membership)
CREATE POLICY "Users can request membership"
  ON public.chapter_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND role = 'member'
  );

-- Allow admin self-insert (for chapter creators)
CREATE POLICY "Chapter creators can add self as admin"
  ON public.chapter_members FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND role = 'admin'
    AND status = 'approved'
  );

-- Chapter admins can update member status
CREATE POLICY "Chapter admins can update members"
  ON public.chapter_members FOR UPDATE
  TO authenticated
  USING (
    is_chapter_admin(auth.uid(), chapter_id)
    OR is_admin(auth.uid())
  );

-- Chapter admins can remove members
CREATE POLICY "Chapter admins can remove members"
  ON public.chapter_members FOR DELETE
  TO authenticated
  USING (
    is_chapter_admin(auth.uid(), chapter_id)
    OR is_admin(auth.uid())
  );

-- Add chapter_id to profiles
ALTER TABLE public.profiles ADD COLUMN chapter_id UUID REFERENCES public.chapters(id);
