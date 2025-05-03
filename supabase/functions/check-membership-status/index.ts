
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    // Step 1: Check if user exists
    const { data: { users }, error: userFetchError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (userFetchError) {
      throw new Error("Error checking user existence");
    }

    // If user doesn't exist, return early with userExists: false
    if (!user) {
      return new Response(
        JSON.stringify({
          userExists: false,
          active: false,
          proratedAmount: 25.00,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Step 2: Check membership status
    const { data: memberships, error: membershipError } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (membershipError) {
      throw new Error("Error checking membership status");
    }

    const membership = memberships?.[0];
    const isActive = membership && 
                     membership.status === "active" && 
                     (!membership.renewal_at || new Date(membership.renewal_at) > new Date());

    // Calculate remaining days for active memberships
    let remainingDays = 0;
    if (isActive && membership.renewal_at) {
      const now = new Date();
      const renewalDate = new Date(membership.renewal_at);
      remainingDays = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    // Get standard membership fee
    const { data: configData } = await supabase
      .from("app_config")
      .select("value")
      .eq("key", "MEMBERSHIP_FEE")
      .single();

    const standardFee = configData ? parseFloat(configData.value) : 25.00;

    // Calculate prorated fee if applicable (for now using standard fee)
    const proratedAmount = standardFee;

    return new Response(
      JSON.stringify({
        userExists: true,
        active: isActive,
        proratedAmount,
        remainingDays,
        membershipId: membership?.id,
        membershipData: membership
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error checking membership status:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
