// seed-demo
// ---------------------------------------------------------------------------
// Creates (or refreshes) 3 demo accounts for QA / product walkthroughs:
//   - Chapter Admin
//   - Chapter Member
//   - Rushee
//
// All accounts share college "Demo University" + org_type "fraternity"
// (gender "male") so RLS lets them see each other. All profiles are marked
// is_test=true to keep them isolated from real chapter data.
//
// Auth: requires SEED_ADMIN_TOKEN bearer token (same shared secret used by
// seed-admin). Service-role key is read from Deno.env only.
// ---------------------------------------------------------------------------
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const DEMO_PASSWORD = "DemoPass123!";
const DEMO_COLLEGE = "Demo University";
const DEMO_ORG = "fraternity";
const DEMO_GENDER = "male";
const DEMO_CHAPTER_NAME = "Demo Chapter";

type DemoUser = {
  email: string;
  role: "chapter" | "rushee";
  full_name: string;
  label: "admin" | "member" | "rushee";
};

const DEMO_USERS: DemoUser[] = [
  { email: "demo.admin@greekbid.test", role: "chapter", full_name: "Demo Chapter Admin", label: "admin" },
  { email: "demo.member@greekbid.test", role: "chapter", full_name: "Demo Chapter Member", label: "member" },
  { email: "demo.rushee@greekbid.test", role: "rushee", full_name: "Demo Rushee", label: "rushee" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // 1. Authorize
    const expectedToken = Deno.env.get("SEED_ADMIN_TOKEN");
    if (!expectedToken) return json({ error: "Server not configured: SEED_ADMIN_TOKEN missing" }, 500);
    const presented = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (presented !== expectedToken) return json({ error: "Unauthorized" }, 401);

    // 2. Service client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) return json({ error: "Server not configured" }, 500);
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 3. Look up existing users
    const { data: existing } = await supabase.auth.admin.listUsers();
    const byEmail = new Map<string, string>();
    for (const u of existing?.users ?? []) {
      if (u.email) byEmail.set(u.email, u.id);
    }

    const created: Record<string, string> = {};

    // 4. Ensure each demo user exists with correct profile
    for (const u of DEMO_USERS) {
      let userId = byEmail.get(u.email);
      if (!userId) {
        const { data: newUser, error: cErr } = await supabase.auth.admin.createUser({
          email: u.email,
          password: DEMO_PASSWORD,
          email_confirm: true,
          user_metadata: {
            role: u.role,
            full_name: u.full_name,
            college: DEMO_COLLEGE,
            gender: DEMO_GENDER,
            org_type: u.role === "chapter" ? DEMO_ORG : "",
          },
        });
        if (cErr) throw cErr;
        userId = newUser.user.id;
      } else {
        // reset password so the demo creds always work
        await supabase.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD, email_confirm: true });
      }
      created[u.label] = userId!;

      // Upsert profile (handle_new_user trigger creates a row on first signup;
      // for existing users we still normalize the demo fields).
      await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            role: u.role,
            full_name: u.full_name,
            college: DEMO_COLLEGE,
            gender: DEMO_GENDER,
            org_type: u.role === "chapter" ? DEMO_ORG : "",
            email: u.email,
            is_test: true,
          },
          { onConflict: "user_id" }
        );
    }

    // 5. Ensure demo chapter exists (created_by = admin so trigger allows admin role)
    const adminId = created.admin;
    const memberId = created.member;

    const { data: existingChapter } = await supabase
      .from("chapters")
      .select("id")
      .eq("name", DEMO_CHAPTER_NAME)
      .eq("college", DEMO_COLLEGE)
      .maybeSingle();

    let chapterId = existingChapter?.id as string | undefined;
    if (!chapterId) {
      const { data: chap, error: chErr } = await supabase
        .from("chapters")
        .insert({
          name: DEMO_CHAPTER_NAME,
          college: DEMO_COLLEGE,
          org_type: DEMO_ORG,
          created_by: adminId,
        })
        .select("id")
        .single();
      if (chErr) throw chErr;
      chapterId = chap.id;
    } else {
      // make sure created_by points at our current admin (so admin row is allowed)
      await supabase.from("chapters").update({ created_by: adminId }).eq("id", chapterId);
    }

    // 6. Ensure memberships (approved, not frozen)
    await supabase
      .from("chapter_members")
      .upsert(
        [
          { chapter_id: chapterId, user_id: adminId, role: "admin", status: "approved" },
          { chapter_id: chapterId, user_id: memberId, role: "member", status: "approved" },
        ],
        { onConflict: "chapter_id,user_id" }
      );

    // Force-approve in case the freeze trigger flipped status
    await supabase
      .from("chapter_members")
      .update({ status: "approved" })
      .in("user_id", [adminId, memberId])
      .eq("chapter_id", chapterId);

    return json({
      success: true,
      password: DEMO_PASSWORD,
      college: DEMO_COLLEGE,
      chapter: DEMO_CHAPTER_NAME,
      accounts: DEMO_USERS.map((u) => ({ role: u.label, email: u.email })),
    });
  } catch (error) {
    console.error("seed-demo failure:", error);
    return json({ error: "Seed failed", detail: String((error as any)?.message ?? error) }, 500);
  }
});
