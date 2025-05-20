
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Checking Stripe mode");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get Stripe mode from admin_config
    const { data, error } = await supabase
      .from("admin_config")
      .select("value")
      .eq("key", "stripe_mode")
      .single();
    
    if (error) {
      console.error("Error fetching stripe mode:", error);
      throw new Error(`Failed to fetch Stripe mode: ${error.message}`);
    }
    
    // Determine mode - default to 'test' for safety
    const mode = data?.value === "live" ? "live" : "test";
    
    console.log("Retrieved Stripe mode:", mode);
    
    // Check Stripe API key type as a double-verification
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const isTestKey = stripeKey.startsWith("sk_test_");
    
    console.log("Stripe key type check:", {
      isTestKey,
      keyTypeMatch: (mode === "test" && isTestKey) || (mode === "live" && !isTestKey)
    });
    
    // If there's a mismatch, warn in the logs but respect the database setting
    if ((mode === "test" && !isTestKey) || (mode === "live" && isTestKey)) {
      console.warn("⚠️ IMPORTANT: Stripe mode in database does not match the type of API key configured");
    }
    
    return new Response(
      JSON.stringify({
        mode,
        isTestKey
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking Stripe mode:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        mode: "test" // Default to test mode on error for safety
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
