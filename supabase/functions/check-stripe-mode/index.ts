
// supabase/functions/check-stripe-mode/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json"
};

serve(async (req) => {
  // Handle OPTIONS request for CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try to get from admin_config table first (newer implementation)
    const { data: adminConfigData, error: adminConfigError } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'stripe_mode')
      .maybeSingle();
    
    if (!adminConfigError && adminConfigData?.value) {
      const mode = adminConfigData.value === 'live' ? 'live' : 'test';
      return new Response(JSON.stringify({ 
        mode,
        source: 'admin_config',
        timestamp: new Date().toISOString() 
      }), {
        status: 200,
        headers: corsHeaders
      });
    }
    
    // Fall back to older app_config table if needed
    const { data, error } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "stripe_mode")
      .maybeSingle();

    // If there's a database error, log it and default to test mode
    if (error) {
      console.error("Database error:", error);
      
      return new Response(JSON.stringify({ 
        mode: "test",
        error: error.message,
        fallback: true,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const mode = data?.value === "live" ? "live" : "test";
    
    return new Response(JSON.stringify({ 
      mode,
      source: 'app_config',
      timestamp: new Date().toISOString() 
    }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err) {
    console.error("check-stripe-mode error:", err);
    return new Response(JSON.stringify({ 
      mode: "test", 
      error: err instanceof Error ? err.message : "Internal Server Error",
      fallback: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200, // Return 200 even on error but with fallback data
      headers: corsHeaders
    });
  }
});
