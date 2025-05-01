
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse the request body to get user details
    const { email, name, phone } = await req.json();
    if (!email) throw new Error("No email provided");

    console.log("Creating checkout session for:", { email, name, phone });

    // Get the origin from request headers or use default preview URL
    const origin = req.headers.get('origin') || 'https://preview-398a5698--eatmeetclub.lovable.app';
    console.log("Using origin:", origin);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Eat Meet Club Membership',
              description: 'Monthly membership for Eat Meet Club',
            },
            unit_amount: 2500, // $25.00 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/signup?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?canceled=true`,
      customer_email: email,
      metadata: {
        name: name || '',
        phone: phone || '',
        is_subscription: 'true',
      },
    });

    console.log("Checkout session created:", { id: session.id, url: session.url });

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
        session_id: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
