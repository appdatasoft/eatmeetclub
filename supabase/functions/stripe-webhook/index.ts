
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const sig = req.headers.get("stripe-signature")!;
    const body = await req.text();

    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email || session.metadata?.user_email;

      if (!email) {
        console.warn("No email found in checkout.session.completed event.");
      } else {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { data: userData, error: fetchError } = await supabase.auth.admin.getUserByEmail(email);

        if (fetchError) {
          console.error("Failed to fetch user:", fetchError);
        } else {
          const { error: updateError } = await supabase.auth.admin.updateUserById(userData.user.id, {
            user_metadata: {
              ...userData.user.user_metadata,
              membership_active: true,
              membership_activated_at: new Date().toISOString(),
              stripe_session_id: session.id,
            },
          });

          if (updateError) {
            console.error("Failed to update user metadata:", updateError);
          } else {
            console.log(`✅ Membership activated for: ${email}`);
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook handler failed" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
