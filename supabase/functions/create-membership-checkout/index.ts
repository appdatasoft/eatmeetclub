
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { stripe, corsHeaders, handleCorsOptions, createJsonResponse, createErrorResponse } from "../_shared/stripe.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return createErrorResponse("Invalid request body", 400);
    }

    const {
      email,
      name,
      phone,
      address,
      amount = 25.0,
      stripeMode = "test",
      redirectToCheckout = true
    } = requestBody;

    if (!email) {
      return createErrorResponse("Missing email", 400);
    }

    // Get appropriate Stripe key based on mode
    const stripeKey = stripeMode === "live"
      ? Deno.env.get("STRIPE_SECRET_KEY_LIVE")
      : Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      return createErrorResponse(`Stripe ${stripeMode} key is not configured`, 500);
    }

    console.log(`Creating checkout session for ${email} with amount ${amount}`);
    
    // Create Stripe checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Eat Meet Club Membership",
                description: "Monthly membership fee"
              },
              unit_amount: Math.round(amount * 100)
            },
            quantity: 1
          }
        ],
        success_url: `${Deno.env.get("SITE_URL")}/membership-confirmed?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${Deno.env.get("SITE_URL")}/membership-payment?canceled=true`,
        metadata: {
          user_email: email,
          user_name: name || "",
          phone: phone || "",
          address: address || ""
        }
      });

      // Optional: trigger welcome email
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-welcome-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, name })
        });
      } catch (err) {
        console.warn("Welcome email failed:", err);
      }

      return createJsonResponse({
        success: true,
        url: redirectToCheckout ? session.url : null,
        sessionId: session.id
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      return createErrorResponse(`Stripe error: ${stripeError instanceof Error ? stripeError.message : String(stripeError)}`, 500);
    }
  } catch (err) {
    console.error("Checkout session creation error:", err);
    return createErrorResponse(err);
  }
});
