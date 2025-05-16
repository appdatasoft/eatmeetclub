
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
    
    // Extract the base origin from redirectUrl to ensure we're using a properly formatted URL
    let redirectTo = redirectUrl;
    
    // Ensure the redirect URL is absolute and properly formatted
    if (!redirectTo.startsWith('http')) {
      // If not absolute, construct a proper URL using a default domain
      const defaultDomain = "https://www.eatmeetclub.com";
      redirectTo = `${defaultDomain}${redirectTo.startsWith('/') ? '' : '/'}${redirectTo}`;
    }
    
    // Ensure the redirect URL includes the /set-password path if it's not already there
    if (!redirectTo.includes('/set-password')) {
      // Strip trailing slash if present
      const baseUrl = redirectTo.endsWith('/') ? redirectTo.slice(0, -1) : redirectTo;
      redirectTo = `${baseUrl}/set-password`;
    }
    
    console.log(`Using redirect URL: ${redirectTo}`);
    
    // Generate a signup link (combines email verification and password setup)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        // Use the provided redirect URL with the set-password path
        emailRedirectTo: redirectTo,
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
