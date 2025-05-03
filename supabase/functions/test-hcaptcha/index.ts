
// Follow this setup guide to integrate the Deno runtime with your Supabase project:
// https://deno.land/manual/getting_started/setup_your_environment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { validateHCaptchaRequest } from "../_shared/hcaptcha.ts";

// Get environment variables
const HCAPTCHA_SECRET_KEY = Deno.env.get("HCAPTCHA_SECRET_KEY") || "";
const HCAPTCHA_SITE_KEY = Deno.env.get("HCAPTCHA_SITE_KEY") || "";

console.log("HCAPTCHA test function loaded");

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Log the request details for debugging
    console.log(`Request received: ${req.method} ${req.url}`);
    console.log(`Headers: ${JSON.stringify(Object.fromEntries(req.headers.entries()))}`);
    
    // Check if we have the required environment variables
    if (!HCAPTCHA_SECRET_KEY) {
      console.error("Missing HCAPTCHA_SECRET_KEY environment variable");
      return new Response(
        JSON.stringify({
          error: "Server misconfiguration: Missing hCaptcha secret key",
          success: false
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Validate the hCaptcha token in the request
    const validation = await validateHCaptchaRequest(req, HCAPTCHA_SECRET_KEY, {
      siteKey: HCAPTCHA_SITE_KEY,
      requireToken: true
    });
    
    if (!validation.success) {
      console.error("hCaptcha validation failed:", validation);
      return new Response(
        JSON.stringify({
          error: validation.error || "hCaptcha validation failed",
          details: validation.details || {},
          success: false
        }),
        {
          status: validation.status || 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        message: "hCaptcha verification successful",
        success: true,
        verification: validation.verification
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error in test-hcaptcha function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
