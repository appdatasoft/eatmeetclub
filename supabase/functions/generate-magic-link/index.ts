
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
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Generating magic link for ${email}`);
    console.log(`[${timestamp}] Original redirectUrl: ${redirectUrl}`);
    
    // Extract just the domain part from the redirectUrl
    let domain = "https://www.eatmeetclub.com"; // Default domain
    
    try {
      if (redirectUrl) {
        const url = new URL(redirectUrl);
        domain = `${url.protocol}//${url.host}`; // Get just the protocol and host
        console.log(`[${timestamp}] Extracted domain: ${domain}`);
      }
    } catch (e) {
      console.error("URL parsing failed:", e);
      // Continue with default domain
    }
    
    // ALWAYS force the path to be /set-password
    const finalRedirectUrl = `${domain}/set-password`;
    
    // CRITICAL DEBUGGING - Log the exact URL being passed to Supabase
    console.log(`[${timestamp}] FINAL redirect URL being passed to Supabase: ${finalRedirectUrl}`);
    
    // Generate a recovery link (for password reset/setup)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: finalRedirectUrl,
      }
    });
    
    if (error) {
      console.error(`[${timestamp}] Error generating magic link:`, error);
      throw error;
    }
    
    // Log the generated link for debugging
    console.log(`[${timestamp}] Magic link generated successfully`);
    
    if (data.properties?.action_link) {
      // Extract and validate the action_link
      try {
        const actionLinkUrl = new URL(data.properties.action_link);
        console.log(`[${timestamp}] Final action_link: ${data.properties.action_link}`);
        
        const params = new URLSearchParams(actionLinkUrl.search);
        const redirectParam = params.get('redirect_to');
        
        if (redirectParam) {
          console.log(`[${timestamp}] Extracted redirect_to param: ${redirectParam}`);
          const redirectToUrl = new URL(redirectParam);
          console.log(`[${timestamp}] redirect_to host: ${redirectToUrl.host}`);
          console.log(`[${timestamp}] redirect_to pathname: ${redirectToUrl.pathname}`);
          
          if (redirectToUrl.pathname !== "/set-password") {
            console.warn(`[${timestamp}] WARNING: Final redirect_to pathname is NOT /set-password: ${redirectToUrl.pathname}`);
          } else {
            console.log(`[${timestamp}] SUCCESS: redirect_to pathname is correctly set to /set-password`);
          }
        } else {
          console.warn(`[${timestamp}] WARNING: No redirect_to parameter found in action_link`);
        }
      } catch (e) {
        console.error(`[${timestamp}] Error parsing action_link URL:`, e);
      }
    }
    
    // Return the generated action link to be used in the welcome email
    return new Response(
      JSON.stringify({
        success: true,
        magicLink: data.properties?.action_link,
        redirectUrl: finalRedirectUrl,
        originalRedirectUrl: redirectUrl,
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
