import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization");
    const { data, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError) throw userError;
    const user = data.user;
    if (!user?.email) throw new Error("Not authenticated");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ subscribed: false, subscription_end: null, discount: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const subs = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: "active",
      limit: 1,
    });

    if (subs.data.length === 0) {
      return new Response(
        JSON.stringify({ subscribed: false, subscription_end: null, discount: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sub = subs.data[0] as any;
    let discount = null;
    const d = sub.discount;
    if (d?.coupon) {
      // Try to retrieve promotion code if present
      let code: string | null = null;
      if (d.promotion_code) {
        try {
          const promo = await stripe.promotionCodes.retrieve(d.promotion_code);
          code = promo.code;
        } catch (_) {}
      }
      discount = {
        code,
        percent_off: d.coupon.percent_off ?? null,
        name: d.coupon.name ?? null,
        duration: d.coupon.duration,
        duration_in_months: d.coupon.duration_in_months ?? null,
      };
    }

    return new Response(
      JSON.stringify({
        subscribed: true,
        subscription_end: sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null,
        discount,
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[check-subscription]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
