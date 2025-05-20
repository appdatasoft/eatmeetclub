
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
    
    // First, construct a base URL (either from the provided redirectUrl or using default)
    let baseUrl = redirectUrl;
    
    // If no redirectUrl is provided or it's not absolute, use a default
    if (!baseUrl || !baseUrl.startsWith('http')) {
      baseUrl = "https://www.eatmeetclub.com";
    }
    
    // Strip any trailing slashes from the baseUrl
    baseUrl = baseUrl.replace(/\/+$/, '');
    
    // Always ensure that the final redirect URL includes the /set-password path
    const finalRedirectUrl = `${baseUrl}/set-password`;
    
    console.log(`Using final redirect URL: ${finalRedirectUrl}`);
    
    // Generate a recovery link (for password reset/setup)
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        // Use the final redirect URL with the /set-password path
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
