
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse the request body to get email
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("No email provided");
    }
    
    console.log("Checking membership status for email:", email);
    
    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Get current date for comparison
    const now = new Date();
    
    // First, get user ID from auth.users
    const { data: userData, error: userError } = await supabaseClient
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (userError) {
      console.error("Error querying user:", userError);
      throw new Error(`Error querying user: ${userError.message}`);
    }
    
    if (!userData) {
      console.log("No user found with email:", email);
      return new Response(
        JSON.stringify({
          success: true,
          membership: null
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Now check for active membership using the user ID
    const { data, error } = await supabaseClient
      .from('memberships')
      .select(`
        id,
        status,
        is_subscription,
        started_at,
        renewal_at,
        subscription_id,
        user_id
      `)
      .eq('user_id', userData.id)
      .eq('status', 'active')
      .or(`renewal_at.gt.${now.toISOString()},renewal_at.is.null`)
      .maybeSingle();
    
    if (error) {
      console.error("Database query error:", error);
      throw new Error(`Error querying memberships: ${error.message}`);
    }
    
    // If membership found, return it
    if (data) {
      console.log("Found active membership:", data);
      
      // Calculate remaining days in subscription
      let remainingDays = 0;
      let proratedAmount = 25.00; // Default full price
      
      if (data.renewal_at) {
        const renewalDate = new Date(data.renewal_at);
        const totalDays = 30; // Assuming 30 days per month
        const elapsedMs = now.getTime() - new Date(data.started_at).getTime();
        const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
        remainingDays = totalDays - elapsedDays;
        
        // Calculate prorated amount (if < 15 days remaining, charge half price)
        if (remainingDays <= 0) {
          proratedAmount = 25.00; // Full price for new period
        } else if (remainingDays < 15) {
          proratedAmount = 12.50; // Half price for less than half a period remaining
        } else {
          proratedAmount = 0; // Free if more than half the period remains
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          membership: {
            ...data,
            remainingDays,
            proratedAmount
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // No active membership found
    return new Response(
      JSON.stringify({
        success: true,
        membership: null
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Error in check-membership-status function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
