
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { stripe, corsHeaders, handleCorsOptions, createJsonResponse, createErrorResponse } from "../_shared/stripe.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return handleCorsOptions();
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return createErrorResponse("Invalid request body", 400);
    }

    const {
      email,
      name,
      phone,
      address
    } = requestBody;

    if (!email) {
      return createErrorResponse("Missing email", 400);
    }

    // Get membership status from database
    const { data: membershipData, error: membershipError } = await supabase
      .from("memberships")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (membershipError) {
      console.error("Membership lookup error:", membershipError);
    }

    const isActive = membershipData?.status === "active" && 
      (membershipData.renewal_at === null || new Date(membershipData.renewal_at) > new Date());
      
    return createJsonResponse({
      success: true,
      active: isActive,
      expiresAt: membershipData?.renewal_at || null,
      membershipId: membershipData?.id || null,
      amount: 25.0
    });
  } catch (err) {
    console.error("Membership status check error:", err);
    return createErrorResponse(err);
  }
});
