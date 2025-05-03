
// supabase/functions/check-stripe-mode/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
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

    // Make sure admin_config table exists first
    try {
      await supabase.rpc('create_admin_config_if_not_exists');
      console.log("Checked admin_config table exists");
    } catch (setupError) {
      console.log("Setup admin_config error (continuing anyway):", setupError);
      
      // Try to create the table directly as fallback
      try {
        const { error: createTableError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS public.admin_config (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            key TEXT NOT NULL UNIQUE,
            value TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          INSERT INTO public.admin_config (key, value)
          VALUES ('stripe_mode', 'test')
          ON CONFLICT (key) DO NOTHING;
        `);
        
        if (createTableError) {
          console.error("Failed to create admin_config table directly:", createTableError);
        }
      } catch (directCreateError) {
        console.error("Failed in direct table creation attempt:", directCreateError);
      }
    }

    // Get Stripe mode from the admin_config table
    const { data, error } = await supabase
      .from("admin_config")
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
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const mode = data?.value === "live" ? "live" : "test";
    
    return new Response(JSON.stringify({ 
      mode,
      timestamp: new Date().toISOString() 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("check-stripe-mode error:", err);
    return new Response(JSON.stringify({ 
      mode: "test", 
      error: "Internal Server Error",
      fallback: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200, // Return 200 even on error but with fallback data
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
