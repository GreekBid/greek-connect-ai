

# Fix: Filter Rushee Notes by College and Org Type

## Problem
The current `RusheeNotes.tsx` fetches ALL chapters from the database without filtering by the rushee's college or organization type. The RLS policy allows admins to see everything, so when testing with an admin account (or any account), unrelated chapters appear.

## Solution
Update `RusheeNotes.tsx` to:
1. First fetch the current user's profile (college and org_type/gender) 
2. Then query chapters filtered by `.eq("college", college)` and `.eq("org_type", orgType)`
3. If the user has no college set, show an empty state prompting them to update their profile

### File: `src/pages/rushee/RusheeNotes.tsx`
- Import `useAuth` to get the current user ID
- Add a first query to get the user's `college` and `gender` from `profiles`
- Derive `org_type` from gender (male → "fraternity", female → "sorority") matching the `get_user_org_type` DB function logic
- Add `.eq("college", college).eq("org_type", orgType)` filters to the chapters query
- Skip fetching chapters if college or org_type is empty, show a message instead

