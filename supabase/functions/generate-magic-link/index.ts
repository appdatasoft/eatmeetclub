
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// IMPORTANT: This needs to use the service role key to access admin features
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateLinkRequest {
  email: string;
  redirectUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    console.log("Generate magic link function called");
    
    const { email, redirectUrl }: GenerateLinkRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    // Log the incoming request for debugging
    console.log(`[${new Date().toISOString()}] Generating magic link for ${email}`);
    console.log(`[${new Date().toISOString()}] Original redirectUrl: ${redirectUrl}`);
    
    // Default redirect domain if none provided
    const defaultDomain = "https://www.eatmeetclub.com";
    
    // CRITICAL: Force /set-password path regardless of input
    let finalRedirectUrl;
    
    try {
      // If redirectUrl is provided, extract just the origin (domain + protocol)
      if (redirectUrl) {
        const parsedUrl = new URL(redirectUrl);
        // Extract just the origin and force the path to /set-password
        const origin = parsedUrl.origin; // This gets just protocol + domain
        finalRedirectUrl = `${origin}/set-password`; // Force the path
      } else {
        finalRedirectUrl = `${defaultDomain}/set-password`;
      }
    } catch (e) {
      // If URL parsing fails, use the default domain
      console.error("URL parsing failed:", e);
      finalRedirectUrl = `${defaultDomain}/set-password`;
    }
    
    // CRITICAL DEBUGGING - Always log the exact URL being used
    console.log(`[${new Date().toISOString()}] FINAL redirect URL being passed to Supabase: ${finalRedirectUrl}`);
    
    // Generate a recovery link (for password reset/setup)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: finalRedirectUrl,
      }
    });
    
    if (error) {
      console.error("Error generating magic link:", error);
      throw error;
    }
    
    // Log the generated link for debugging
    console.log(`[${new Date().toISOString()}] Magic link generated successfully`);
    
    if (data.properties?.action_link) {
      const actionLinkUrl = new URL(data.properties.action_link);
      const params = new URLSearchParams(actionLinkUrl.search);
      const redirectParam = params.get('redirect_to');
      
      console.log(`[${new Date().toISOString()}] Final action_link: ${data.properties.action_link}`);
      console.log(`[${new Date().toISOString()}] Extracted redirect_to param: ${redirectParam}`);
      
      if (redirectParam && !redirectParam.endsWith('/set-password')) {
        console.warn(`[${new Date().toISOString()}] WARNING: redirect_to parameter does not end with /set-password: ${redirectParam}`);
      }
    }
    
    // Return the generated action link to be used in the welcome email
    return new Response(
      JSON.stringify({
        success: true,
        magicLink: data.properties?.action_link,
        redirectUrl: finalRedirectUrl, // Return the redirect URL for debugging
        originalRedirectUrl: redirectUrl // Return the original redirect URL for debugging
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error generating magic link:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An error occurred while generating the magic link",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
