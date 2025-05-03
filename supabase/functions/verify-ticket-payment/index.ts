
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
    const { sessionId, email, eventId } = await req.json();
    if (!sessionId || !email || !eventId) throw new Error("Missing required fields");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session.customer_email || session.customer_email !== email) {
      throw new Error("Email mismatch or missing from session");
    }

    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList.users.find((u) => u.email === email);
    const userId = user?.id;
    if (!userId) throw new Error("User not found");

    const amount = session.amount_total || 1000;

    // Insert event ticket purchase
    const { error: insertError } = await supabase.from("event_attendees").insert({
      user_id: userId,
      event_id: eventId,
      payment_id: sessionId,
      amount: amount / 100,
      status: "confirmed"
    });

    if (insertError) throw new Error("Failed to record ticket: " + insertError.message);

    // Optionally: send ticket confirmation email
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
    await fetch(`${frontendUrl}/functions/v1/send-ticket-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        email,
        eventId,
        name: user.user_metadata?.full_name || "Guest"
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
