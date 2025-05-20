
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
    
    console.log(`Generating magic link for ${email} with redirect to ${redirectUrl}`);
    
    // Always ensure the redirect URL ends with /set-password
    let finalRedirectUrl;
    
    try {
      // Parse the redirectUrl to extract domain
      const parsedUrl = new URL(redirectUrl || "https://www.eatmeetclub.com");
      
      // IMPORTANT: Force the path to be /set-password regardless of what was provided
      parsedUrl.pathname = "/set-password";
      finalRedirectUrl = parsedUrl.toString();
      
      // Double-check the URL is correct
      console.log("Parsed URL object:", {
        href: parsedUrl.href,
        origin: parsedUrl.origin,
        pathname: parsedUrl.pathname,
        host: parsedUrl.host
      });
    } catch (e) {
      // If URL parsing fails, use a hardcoded default with /set-password
      console.error("URL parsing failed:", e);
      finalRedirectUrl = "https://www.eatmeetclub.com/set-password";
    }
    
    console.log(`FINAL redirect URL being used: ${finalRedirectUrl}`);
    
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
    
    console.log("Magic link generated successfully");
    console.log("Action link property:", data.properties?.action_link);
    
    // Check if the action link contains the correct redirect URL
    if (data.properties?.action_link) {
      const actionLinkUrl = new URL(data.properties.action_link);
      const params = new URLSearchParams(actionLinkUrl.search);
      const redirectParam = params.get('redirect_to');
      console.log("Redirect parameter in action link:", redirectParam);
      
      if (redirectParam && !redirectParam.endsWith('/set-password')) {
        console.warn("WARNING: redirect_to parameter does not end with /set-password:", redirectParam);
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
