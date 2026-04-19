

## Diagnosis

The user "Chi phi" (email: amamamama@gmail.com) signed up at Aaniiih Nakoda College on 2026-04-15 with role=`chapter`, but **no row was ever inserted into the `chapters` table**. Their `profiles.chapter_id` is also NULL.

What this means:
- A profile exists with role "chapter"
- But there is no actual chapter entity in the `chapters` table
- And no `chapter_members` row linking them as admin

So the Admin Dashboard correctly shows zero chapters for that college — there literally isn't one in the database.

### Why this happened

Signup creates a `profiles` row automatically (via the `handle_new_user` trigger), but creating the actual chapter entity is a **separate step**. The user appears to have:
- Completed signup (profile created), then
- Either bailed out before completing chapter creation, or
- Hit an error during the "create chapter" step that was never surfaced

Their account is essentially in a half-initialized state: they have a chapter-role profile but no chapter to be admin of. They likely can't access the dashboard properly because `PendingApprovalGate` requires an approved `chapter_members` row.

## Options to fix

You have two paths. Pick one:

### Option A — Create the chapter for them (recommended if they're a real user)

Insert the missing rows so their account works:
1. Create a `chapters` row: name="Chi Phi", college="Aaniiih Nakoda College", org_type="fraternity", created_by=their user_id
2. Create a `chapter_members` row: user_id=theirs, chapter_id=new, role="admin", status="approved"
3. Update their `profiles.chapter_id` to point to the new chapter

After this, they'll show up in the Admin Dashboard and can log in normally.

### Option B — Delete the orphaned account

If this looks like a test/abandoned signup (the name "Chi phi" as a person's full name and email "amamamama@gmail.com" suggest test data), just delete the profile and let them re-register cleanly.

## Bonus: prevent this in the future

The root cause is that signup and chapter creation are decoupled with no recovery path. To prevent half-initialized chapter accounts going forward, we could:
- Make the chapter signup flow atomic (profile + chapter + admin membership in one transaction), OR
- Add a "complete your chapter setup" gate that catches chapter-role users with no `chapter_id` and forces them to finish creating/joining a chapter before proceeding

I'd recommend doing this fix after we resolve the immediate user, but it's optional.

## What I need from you

Which option do you want?
- **A**: Fix this user's account (create the chapter + admin membership)
- **B**: Delete the orphaned profile
- **A + bonus**: Fix this user AND add a "complete chapter setup" gate so this can't happen again

