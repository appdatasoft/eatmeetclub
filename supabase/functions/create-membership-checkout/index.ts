
// supabase/functions/create-membership-checkout/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control, pragma, expires",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 204
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // For authenticated requests, get the user from the auth header
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data, error: userError } = await supabase.auth.getUser(token);
      if (data?.user && !userError) {
        user = data.user;
      }
    }

    const body = await req.json();
    const { email, name, phone, address } = body;

    // Use user email from auth if not provided in request
    const userEmail = email || user?.email;
    
    if (!userEmail) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // TODO: integrate with Stripe or other logic to generate checkout URL
    const checkoutUrl = `https://checkout.stripe.com/test/membership-success?email=${encodeURIComponent(userEmail)}`;

    return new Response(JSON.stringify({ success: true, url: checkoutUrl }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("Error in create-membership-checkout:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
