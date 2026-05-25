# Strict Input Validation & Sanitization

Add schema-based validation everywhere user input enters the system: client forms before DB writes, and edge functions before processing. Use **zod** as the single source of truth — type checks, length limits, format checks, and `.strict()` to reject unexpected fields.

## Approach

1. **Central schema module** — `src/lib/schemas.ts` exporting one zod schema per domain object. Replace the thin `src/lib/validation.ts` helpers with zod-based equivalents (keep `LIMITS` for backward compat).
2. **Client wiring** — each form calls `schema.safeParse(input)` before any Supabase write. On failure, show the first error via `toast` and abort. Sanitization = `.trim()` + length cap + character whitelisting for handles (Instagram, Snapchat, TikTok, LinkedIn, Twitter).
3. **Edge function wiring** — every function that reads `req.json()` / query params parses with a zod schema and returns `400` with field errors on failure. Use `.strict()` to reject unexpected fields.
4. **Shared edge schemas** — `supabase/functions/_shared/schemas.ts` so client and server schemas stay aligned where they overlap.

## Schemas to define

**Profile** (rushee + chapter):
- `full_name` 1-80, `bio` ≤500, `major` ≤80, `hometown` ≤80, `college` ≤120
- Social handles: regex `^[a-zA-Z0-9._-]{1,30}$` (LinkedIn ≤100, URL-safe slug)
- `interests` array, max 20 items, each ≤40 chars
- `gender` enum `['male','female']`, `org_type` enum `['fraternity','sorority']`
- `avatar_url` must be https URL on our storage origin

**Auth** (signup/login/reset): email (≤255), password (8-72), `full_name`, `role` enum, `college`

**Chapter**: `name` 2-100, `college` 2-120, `org_type` enum

**Event**: `name` 2-120, `description` ≤1000, `date` ISO, `time` HH:MM, `location` ≤200, `capacity` int 1-10000, `vibe`/`attire` ≤40

**Message / Direct message**: `content` 1-2000, `message_type` enum, `recipient_ids` uuid[] (≥1, ≤500)

**Rush notes**: `content` ≤2000, `subject_type` enum, `subject_id` uuid

**Bids / Rankings / Stars / Favorites**: uuid checks, `vote` enum, `status` enum, `notes` ≤1000

**Edge function payloads**: `chat` (messages array, role/content checks, content ≤4000), `create-checkout` / `customer-portal` / `check-subscription` (price_id format, return_url same-origin), `handle-email-unsubscribe` (token format), `preview-transactional-email` (template enum, recipient email).

## Files to change

- **New** `src/lib/schemas.ts` — all client schemas + `parseOrToast()` helper
- **New** `supabase/functions/_shared/schemas.ts` — server schemas using `npm:zod`
- **Update** `src/lib/validation.ts` — re-export from schemas, keep LIMITS
- **Update forms** (validate before insert/update): SignupPage, LoginPage, ForgotPasswordPage, ResetPasswordPage, RusheeProfile, RusheeSettings, RusheeMessages, RusheeSearchChapters, RusheeEvents, dashboard/EventsPage, MessagesPage, MembersPage, ProfilesPage, RankingsPage, BidsPage, SettingsPage, NotesPanel, admin/AdminDashboard
- **Update edge functions**: `chat`, `create-checkout`, `customer-portal`, `check-subscription`, `handle-email-unsubscribe`, `handle-email-suppression`, `preview-transactional-email`, `send-transactional-email`, `process-email-queue`
- **Add dep**: `zod` (already standard in Lovable projects; verify in package.json)

## Sanitization rules

- All free text: `.trim()`, collapse internal whitespace runs only for names/handles
- Social handles: strip leading `@`, lowercase, regex whitelist
- URLs: `z.string().url()` + protocol allowlist (`https:` only for external)
- No raw HTML rendering anywhere — schemas reject `<script` patterns defensively; rely on React's escaping for display
- UUIDs: `z.string().uuid()` on every id field accepted from the client

## Error UX

- Client: toast with first field error; inline error under field where the form already supports it
- Server: `400` with `{ error: { field: ["msg"] } }` shape from `parsed.error.flatten().fieldErrors`

## Out of scope

- Rate limiting (paused per earlier message)
- Rewriting forms to use react-hook-form (validation will be added without restructuring forms)
- DB-level CHECK constraints (RLS + zod cover the surface; CHECK constraints are brittle with time-based rules per project guidance)

## Verification

- Build passes
- Manual smoke: submit empty form → toast; submit overlong message → toast; signup with bad email → toast; call `chat` edge function with missing `messages` → 400
