
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateLinkRequest {
  email: string;
  redirectUrl: string;
  type?: "signup" | "recovery" | "invite";
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
    const { email, redirectUrl, type = "recovery" }: GenerateLinkRequest = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }
    
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Generating ${type} link for ${email}`);
    console.log(`[${timestamp}] Original redirectUrl: ${redirectUrl}`);
    
    // Extract the domain from the redirectUrl
    let domain = "";
    
    try {
      if (redirectUrl) {
        const url = new URL(redirectUrl);
        domain = `${url.protocol}//${url.host}`;
      } else {
        // Fallback to request origin or a default
        domain = req.headers.get("origin") || "https://www.eatmeetclub.com";
      }
    } catch (e) {
      console.error("URL parsing failed:", e);
      domain = req.headers.get("origin") || "https://www.eatmeetclub.com";
      console.log(`[${timestamp}] Falling back to domain from headers: ${domain}`);
    }
    
    // Always preserve the full redirectUrl for recovery links
    let finalRedirectUrl = redirectUrl;
    
    // If no redirectUrl was provided, construct one based on the type
    if (!redirectUrl) {
      let finalPath = "/login?verified=true";
      if (type === "recovery") {
        finalPath = "/set-password";
      }
      
      finalRedirectUrl = `${domain}${finalPath}`;
    }
    
    console.log(`[${timestamp}] FINAL redirect URL: ${finalRedirectUrl}`);
    
    // Generate the appropriate link
    let result;
    
    if (type === "signup") {
      result = await supabase.auth.admin.generateLink({
        type: "signup",
        email: email,
        options: {
          redirectTo: finalRedirectUrl,
        }
      });
    } else if (type === "recovery") {
      result = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: email,
        options: {
          redirectTo: finalRedirectUrl,
        }
      });
    } else if (type === "invite") {
      result = await supabase.auth.admin.generateLink({
        type: "invite",
        email: email,
        options: {
          redirectTo: finalRedirectUrl,
        }
      });
    } else {
      throw new Error(`Invalid link type: ${type}`);
    }
    
    const { data, error } = result;
    
    if (error) {
      console.error(`[${timestamp}] Error generating link:`, error);
      throw error;
    }
    
    console.log(`[${timestamp}] Link generated successfully`);
    
    // Extract and validate the action_link
    if (data.properties?.action_link) {
      console.log(`[${timestamp}] Final action_link: ${data.properties.action_link}`);
    } else {
      console.error(`[${timestamp}] No action_link found in response`);
    }
    
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
    console.error("Error generating link:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An error occurred while generating the link",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
