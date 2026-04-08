## Chapter Member System

### Database Changes (Migration)
1. **New `chapters` table** — stores unique chapter entities (name, college, org_type, created_by). Unique constraint on (name + college).
2. **New `chapter_members` table** — links users to chapters with status (pending/approved/rejected) and a role (admin/member).
3. **Update `profiles` table** — add `chapter_id` column (nullable UUID) referencing `chapters.id` for chapter-role users.
4. **RLS policies** — chapters viewable by same college/org_type users; chapter_members manageable by chapter admin; members can view own status.
5. **Update `handle_new_user` trigger** — when a chapter creator signs up, auto-create a row in `chapters` table and set them as admin in `chapter_members`.

### Signup Flow Changes
- **Chapter creator signup**: Same as current, but chapter name must be unique per college. On signup, creates a `chapters` row and a `chapter_members` row with role=admin, status=approved.
- **Chapter member signup**: New option on the role selection screen ("I'm a Chapter Member"). They pick college → see dropdown of registered chapters at that college → select one → sign up. Creates profile with role=chapter, and a `chapter_members` row with role=member, status=pending.

### Chapter Admin Dashboard Changes
- **New "Members" page** (`/dashboard/members`) — shows pending requests (accept/reject), approved members with activity summary, and ability to remove members.
- Members' votes, rankings, stars, and notes are visible to the chapter admin.

### Chapter Member Experience
- Same dashboard layout as chapter admin but with a "pending approval" gate.
- Once approved, they can view rushee profiles, vote, rank, star, and take notes — all scoped to their chapter.
- Their activity (votes, rankings) is visible to the chapter admin on the Members page.

### Key Constraints
- Chapter name + college must be unique (no duplicate chapter registrations)
- Only the original creator is the admin; members join with "member" role
- Admin has full control: approve, reject, remove members
- All existing RLS policies continue to work since members share the same college + org_type
