
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

    // Check if admin_config table exists
    let hasTable = false;
    try {
      const { error: tableCheckError } = await supabase
        .from('admin_config')
        .select('count')
        .limit(1);
      
      hasTable = !tableCheckError;
    } catch (tableCheckError) {
      console.log("Error checking admin_config table:", tableCheckError);
      hasTable = false;
    }

    // Create the table if it doesn't exist
    if (!hasTable) {
      try {
        console.log("Creating admin_config table");
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
          console.error("Failed to create admin_config table:", createTableError);
          return new Response(JSON.stringify({ 
            mode: "test",
            error: "Failed to create admin_config table",
            fallback: true,
            timestamp: new Date().toISOString()
          }), {
            status: 200,
            headers: corsHeaders
          });
        }
      } catch (error) {
        console.error("Error creating admin_config table:", error);
        return new Response(JSON.stringify({ 
          mode: "test",
          error: "Failed to create admin_config table",
          fallback: true,
          timestamp: new Date().toISOString()
        }), {
          status: 200,
          headers: corsHeaders
        });
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
        headers: corsHeaders
      });
    }

    const mode = data?.value === "live" ? "live" : "test";
    
    return new Response(JSON.stringify({ 
      mode,
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
