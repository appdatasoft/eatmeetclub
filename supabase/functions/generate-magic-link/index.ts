
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
    
    // CRITICAL: Ensure we properly construct the URL with /set-password path
    let finalRedirectUrl;
    
    try {
      if (redirectUrl) {
        // Parse the URL to get just the origin/domain
        const url = new URL(redirectUrl);
        // CRITICAL FIX: Explicitly set the pathname to /set-password
        url.pathname = "/set-password";
        finalRedirectUrl = url.toString();
        
        console.log(`[${new Date().toISOString()}] Constructed URL from input: ${finalRedirectUrl}`);
      } else {
        // If no redirectUrl provided, use the default with /set-password path
        finalRedirectUrl = `${defaultDomain}/set-password`;
        console.log(`[${new Date().toISOString()}] Using default URL: ${finalRedirectUrl}`);
      }
    } catch (e) {
      // If URL parsing fails, use the default domain with /set-password path
      console.error("URL parsing failed:", e);
      finalRedirectUrl = `${defaultDomain}/set-password`;
      console.log(`[${new Date().toISOString()}] Error occurred, using default URL: ${finalRedirectUrl}`);
    }
    
    // Make one final verification that the path is correct
    try {
      const verifyUrl = new URL(finalRedirectUrl);
      if (verifyUrl.pathname !== "/set-password") {
        console.warn(`[${new Date().toISOString()}] WARNING: Path is not /set-password, fixing it now`);
        verifyUrl.pathname = "/set-password";
        finalRedirectUrl = verifyUrl.toString();
      }
      
      // Final check to ensure no trailing slash issues
      if (finalRedirectUrl.endsWith("//set-password")) {
        finalRedirectUrl = finalRedirectUrl.replace("//set-password", "/set-password");
        console.log(`[${new Date().toISOString()}] Fixed double slash issue: ${finalRedirectUrl}`);
      }
    } catch (e) {
      console.error("URL verification failed:", e);
    }
    
    // CRITICAL DEBUGGING - Log the exact URL being used
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
      // Extract and validate the action_link
      const actionLinkUrl = new URL(data.properties.action_link);
      const params = new URLSearchParams(actionLinkUrl.search);
      const redirectParam = params.get('redirect_to');
      
      console.log(`[${new Date().toISOString()}] Final action_link: ${data.properties.action_link}`);
      console.log(`[${new Date().toISOString()}] Extracted redirect_to param: ${redirectParam}`);
      
      // Verify the redirect_to parameter
      if (redirectParam) {
        try {
          const redirectToUrl = new URL(redirectParam);
          console.log(`[${new Date().toISOString()}] redirect_to host: ${redirectToUrl.host}`);
          console.log(`[${new Date().toISOString()}] redirect_to pathname: ${redirectToUrl.pathname}`);
          
          if (redirectToUrl.pathname !== "/set-password") {
            console.warn(`[${new Date().toISOString()}] WARNING: Final redirect_to pathname is NOT /set-password: ${redirectToUrl.pathname}`);
          } else {
            console.log(`[${new Date().toISOString()}] SUCCESS: redirect_to pathname is correctly set to /set-password`);
          }
        } catch (e) {
          console.error(`[${new Date().toISOString()}] Error parsing redirect_to URL:`, e);
        }
      } else {
        console.warn(`[${new Date().toISOString()}] WARNING: No redirect_to parameter found in action_link`);
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
