
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
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    // Try to get from admin_config table first (newer implementation)
    let adminConfigData = null;
    let adminConfigError = null;
    
    try {
      const adminConfigResponse = await supabase
        .from('admin_config')
        .select('value')
        .eq('key', 'stripe_mode')
        .maybeSingle();
      
      adminConfigData = adminConfigResponse.data;
      adminConfigError = adminConfigResponse.error;
    } catch (fetchError) {
      console.error("Failed to fetch from admin_config:", fetchError);
      adminConfigError = { message: fetchError instanceof Error ? fetchError.message : "Unknown error" };
    }
    
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
    
    // Log the error but don't fail yet, try the fallback
    if (adminConfigError) {
      console.warn("Failed to fetch from admin_config:", adminConfigError);
    }
    
    // Fall back to older app_config table if needed
    let appConfigData = null;
    let appConfigError = null;
    
    try {
      const appConfigResponse = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "stripe_mode")
        .maybeSingle();
      
      appConfigData = appConfigResponse.data;
      appConfigError = appConfigResponse.error;
    } catch (fetchError) {
      console.error("Failed to fetch from app_config:", fetchError);
      appConfigError = { message: fetchError instanceof Error ? fetchError.message : "Unknown error" };
    }

    // If there's a database error, log it and default to test mode
    if (appConfigError) {
      console.error("Database error:", appConfigError);
      
      return new Response(JSON.stringify({ 
        mode: "test",
        error: typeof appConfigError === 'object' ? appConfigError.message : String(appConfigError),
        fallback: true,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const mode = appConfigData?.value === "live" ? "live" : "test";
    
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
