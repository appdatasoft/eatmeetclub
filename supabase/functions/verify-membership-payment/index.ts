
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { sessionId, email } = await req.json();
    if (!sessionId || !email) throw new Error("Missing sessionId or email");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session.customer_email || session.customer_email !== email) {
      throw new Error("Email mismatch or missing from session");
    }

    const userResp = await supabase.auth.admin.listUsers();
    const user = userResp.data.users.find((u) => u.email === email);
    const userId = user?.id;
    if (!userId) throw new Error("User not found");

    const subscriptionId = session.subscription;
    const amount = session.amount_total || 2500;

    // Insert membership
    const { data: membership, error: mErr } = await supabase.from("memberships").insert({
      user_id: userId,
      status: "active",
      is_subscription: true,
      started_at: new Date().toISOString(),
      renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_id: subscriptionId,
      last_payment_id: sessionId,
    }).select().single();

    if (mErr) throw new Error("Failed to insert membership: " + mErr.message);

    // Insert payment record
    const { error: pErr } = await supabase.from("membership_payments").insert({
      membership_id: membership.id,
      payment_id: sessionId,
      amount: amount / 100,
      payment_status: "succeeded"
    });

    if (pErr) throw new Error("Failed to insert payment: " + pErr.message);

    // Send invoice email
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
    await fetch(`${frontendUrl}/functions/v1/send-invoice-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        email,
        name: user.user_metadata?.full_name || "Member"
      }),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
