
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control, pragma, expires",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the request body
    const { email, userId } = await req.json();

    // If userId is provided, check for active membership
    if (userId) {
      console.log("Checking membership status for user ID:", userId);
      
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select('id, status, renewal_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      // Check if membership exists and is active (not expired)
      const hasActiveMembership = memberships && 
        memberships.status === 'active' && 
        (!memberships.renewal_at || new Date(memberships.renewal_at) > new Date());

      return new Response(
        JSON.stringify({
          hasActiveMembership,
          membership: memberships
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If email is provided, check if user exists
    if (email) {
      console.log("Checking if user exists with email:", email);
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Filter users by email
      const matchingUsers = users.filter(u => u.email === email);

      return new Response(
        JSON.stringify({
          users: matchingUsers,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("Either email or userId must be provided");

  } catch (error) {
    console.error("Error in check-membership-status function:", error.message);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred while checking membership status",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
