
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
    // Parse the request body to get the payment ID and user details
    const { paymentId, email, name, phone } = await req.json();
    if (!paymentId) throw new Error("No payment ID provided");
    if (!email) throw new Error("No email provided");
    if (!name) throw new Error("No name provided");

    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate a random password for the new user
    const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Verify the payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment not successful: ${paymentIntent.status}`);
    }
    
    // Create the user account in Supabase
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name: name,
        phone: phone || null,
        is_member: true,
        membership_started: new Date().toISOString()
      }
    });

    if (userError) {
      throw new Error(`Error creating user: ${userError.message}`);
    }

    // Send a password reset email so the user can set their own password
    const { error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (resetError) {
      console.error("Error sending password reset email:", resetError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Membership activated and account created successfully",
        userId: userData.user.id,
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
