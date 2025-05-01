
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

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

    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Extract the user's authToken if present
    let authToken = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
      console.log("Auth token received");
    } else {
      console.log("No auth token provided in headers");
    }
    
    // Try to validate the token and get the user
    let userId = null;
    if (authToken) {
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(authToken);
        if (!userError && userData?.user) {
          userId = userData.user.id;
          console.log("User authenticated:", userId);
        } else {
          console.log("Token validation failed:", userError?.message);
        }
      } catch (error) {
        console.error("Error validating token:", error.message);
      }
    }

    // Get the origin from request headers or use default preview URL
    const origin = req.headers.get('origin') || 'https://www.eatmeetclub.com';
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
        user_id: userId || '', // Include the user ID in metadata
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
