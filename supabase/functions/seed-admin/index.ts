// seed-admin
// ---------------------------------------------------------------------------
// One-shot bootstrap that ensures a platform-admin account exists.
//
// OWASP secret handling (A02:2021 – Cryptographic Failures, A07 – ID & Auth):
//   - NO credentials are hardcoded. Email/password come from runtime secrets
//     (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) stored in Lovable Cloud.
//   - Caller MUST present `SEED_ADMIN_TOKEN` in the Authorization header.
//     Without it, the function refuses to act so a leaked public URL cannot
//     reset the admin account.
//   - The service-role key is only ever read server-side via `Deno.env` and
//     never returned in any response payload or log line.
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // --- 1. Authorize caller -------------------------------------------------
    // Require a shared-secret bearer token. This prevents anonymous callers
    // from re-seeding or re-enabling the admin account.
    const expectedToken = Deno.env.get("SEED_ADMIN_TOKEN");
    if (!expectedToken) {
      return json({ error: "Server not configured: SEED_ADMIN_TOKEN missing" }, 500);
    }
    const presented = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (presented !== expectedToken) {
      return json({ error: "Unauthorized" }, 401);
    }

    // --- 2. Load secrets -----------------------------------------------------
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const adminEmail = Deno.env.get("SEED_ADMIN_EMAIL");
    const adminPassword = Deno.env.get("SEED_ADMIN_PASSWORD");
    if (!supabaseUrl || !serviceRoleKey || !adminEmail || !adminPassword) {
      return json({ error: "Server not configured: missing required secrets" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // --- 3. Ensure user exists ----------------------------------------------
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingAdmin = existingUsers?.users?.find((u: any) => u.email === adminEmail);

    let userId: string;
    if (existingAdmin) {
      userId = existingAdmin.id;
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { role: "chapter", full_name: "Admin" },
      });
      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // --- 4. Ensure admin role row exists ------------------------------------
    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (roleError) throw roleError;

    // Note: do NOT echo the password back in the response.
    return json({ success: true, message: "Admin account ready", email: adminEmail });
  } catch (error) {
    // Avoid leaking internal error details to the client.
    console.error("seed-admin failure:", error);
    return json({ error: "Seed failed" }, 500);
  }
});
