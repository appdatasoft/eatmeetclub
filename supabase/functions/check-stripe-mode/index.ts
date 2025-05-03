
// supabase/functions/check-stripe-mode/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to fetch the mode from database
    let mode = "test"; // Default to test mode for safety
    
    try {
      const { data: config, error } = await supabase
        .from("admin_config")
        .select("stripe_mode")
        .single();

      if (!error && config?.stripe_mode) {
        mode = config.stripe_mode;
      }
    } catch (dbError) {
      console.error("Error fetching Stripe mode from database:", dbError);
      // Continue with default test mode
    }
    
    // Also attempt to fetch the publishable key
    const key = mode === "live" 
      ? Deno.env.get("STRIPE_PUBLISHABLE_KEY_LIVE")
      : Deno.env.get("STRIPE_PUBLISHABLE_KEY_TEST");

    return new Response(JSON.stringify({ 
      mode,
      isTestMode: mode === "test",
      key: key || null
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("check-stripe-mode error:", err);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error",
      mode: "test", // Default to test mode on error for safety
      isTestMode: true
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
