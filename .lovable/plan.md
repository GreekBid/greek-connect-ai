

# Fix: Members Showing as "Unknown" in Chapter View

## Problem

The Members page fetches profiles for chapter members, but the database security policy on `profiles` requires matching `college` AND `org_type`. Chapter members (rushees) have a different `org_type` than the chapter account, so the profile lookup returns empty results — hence "Unknown".

## Solution

Create a database function (`get_chapter_member_profiles`) that runs with elevated privileges (`SECURITY DEFINER`) to fetch profile data for members of a given chapter. This is safe because it only returns profiles for users who are actual members of the caller's chapter.

### Step 1: Database migration

Create a `SECURITY DEFINER` function that:
- Accepts a `chapter_id` parameter
- Verifies the caller is the chapter creator or an admin of that chapter
- Returns `user_id, full_name, avatar_url, college, email` for all `chapter_members` of that chapter

### Step 2: Update MembersPage.tsx

Replace the direct `profiles` table query (line 74-77) with an RPC call to the new function:
```ts
const { data: profiles } = await supabase.rpc("get_chapter_member_profiles", {
  p_chapter_id: membership.chapter_id,
});
```

This bypasses the restrictive RLS on profiles while remaining secure (only returns data for the caller's own chapter members).

