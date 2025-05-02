
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
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse the request body to get user details
    const { email, name, phone, address } = await req.json();
    if (!email) throw new Error("No email provided");

    console.log("Creating checkout session for:", { email, name, phone, address });

    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Extract the user's authToken if present (optional)
    let authToken = null;
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
      console.log("Auth token received");
      
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
    } else {
      console.log("No auth token provided - proceeding with guest checkout");
    }

    // Get origin from request or use a default value
    const origin = req.headers.get("origin") || "http://localhost:5173";
    console.log("Using origin for redirects:", origin);

    // Instead of creating a checkout session, create a PaymentIntent or SetupIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2500, // $25.00 in cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        name: name || '',
        phone: phone || '',
        address: address || '',
        email: email,
        is_subscription: 'true',
        user_id: userId || '',
      },
      receipt_email: email,
      setup_future_usage: 'off_session', // For future subscription payments
    });

    console.log("Payment intent created:", { id: paymentIntent.id, client_secret: paymentIntent.client_secret ? 'exists' : 'undefined' });

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
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
