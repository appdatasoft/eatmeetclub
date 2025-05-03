// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_WEBHOOK_SECRET")!, {
  apiVersion: "2022-11-15",
  typescript: true
});

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing signature", { status: 400 });
  }

  const bodyText = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(bodyText, sig, Deno.env.get("STRIPE_ENDPOINT_SECRET")!);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the successful payment event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;

    if (email) {
      const { error } = await supabase
        .from("memberships")
        .upsert({
          user_email: email,
          status: "active",
          activated_at: new Date().toISOString(),
          expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        }, { onConflict: "user_email" });

      if (error) {
        console.error("Failed to update membership:", error);
        return new Response("Failed to update membership", { status: 500 });
      }
    }
  }

  return new Response("Webhook received", { status: 200 });
});
