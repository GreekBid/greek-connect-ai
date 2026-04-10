

# Replace Mock Chapters with Real Data in Rushee Notes

## Problem
The Rushee Notes page uses hardcoded mock chapters (Alpha Beta Gamma, Delta Epsilon, etc.). It should instead show only real chapters registered on GreekBid that match the rushee's college and gender/org_type.

## Solution
Update `RusheeNotes.tsx` to query the `chapters` table (filtered by the rushee's college and org_type via existing RLS policies) instead of using `mockChapters`. The existing RLS policy on `chapters` already enforces college + org_type matching, so a simple `select *` will return only relevant chapters.

## Changes

### 1. Update `src/pages/rushee/RusheeNotes.tsx`
- Remove the `mockChapters` array
- Add a `useEffect` that fetches chapters from the `chapters` table using the Supabase client
- Map chapter data to the same shape used by the UI (`id`, `name`, `letters` derived from the chapter name initials)
- Show a loading state while fetching
- Show an empty state if no chapters are registered at their college

No database or backend changes needed — the existing `chapters` table and RLS policies already support this query.

