
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
    
    // Always use the domain from the request or default to eatmeetclub.com
    // This ensures we're always using the correct domain
    let domain = "https://www.eatmeetclub.com";
    
    // If redirectUrl contains a valid domain, use that instead
    if (redirectUrl && redirectUrl.match(/^https?:\/\//)) {
      try {
        const url = new URL(redirectUrl);
        domain = `${url.protocol}//${url.host}`;
      } catch (e) {
        console.warn("Invalid redirect URL provided, using default domain");
      }
    }
    
    // Always append /set-password to the domain (without any duplicate slashes)
    const finalRedirectUrl = `${domain.replace(/\/+$/, '')}/set-password`;
    
    console.log(`Using final redirect URL: ${finalRedirectUrl}`);
    
    // Generate a recovery link (for password reset/setup)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        // Force the redirectTo to always use our constructed URL
        redirectTo: finalRedirectUrl,
      }
    });
    
    if (error) {
      console.error("Error generating magic link:", error);
      throw error;
    }
    
    console.log("Magic link generated successfully");
    
    // Return the generated action link to be used in the welcome email
    return new Response(
      JSON.stringify({
        success: true,
        magicLink: data.properties?.action_link,
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
