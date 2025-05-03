
// supabase/functions/check-membership-status/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

serve(async (req) => {
  // Handle preflight CORS request
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Check if user exists first
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError);
      return new Response(JSON.stringify({ error: userError.message }), {
        status: 500,
        headers: corsHeaders
      });
    }
    
    const user = users.users.find(u => u.email === email);
    
    // If user doesn't exist, return early
    if (!user) {
      return new Response(JSON.stringify({ 
        users: [],
        active: false,
        remainingDays: 0,
        proratedAmount: 0,
        userExists: false
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // If user exists, check for membership
    const { data, error } = await supabase
      .from("memberships")
      .select("*, user:users(email)")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is okay, other errors are not
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    // No membership found
    if (!data) {
      return new Response(JSON.stringify({
        users: [{ id: user.id }],
        active: false,
        remainingDays: 0,
        proratedAmount: 25.0, // Full price for new memberships
        userExists: true,
        hasActiveMembership: false
      }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // Calculate membership status
    const isActive = data?.status === "active" && new Date(data.expires_at || data.renewal_at) > new Date();
    const remainingDays = data?.expires_at || data?.renewal_at
      ? Math.ceil((new Date(data.expires_at || data.renewal_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 0;

    // Only calculate prorated amount for expired memberships
    const proratedAmount = isActive ? 0 : Math.max(5, 25 - (remainingDays * (25 / 30)));

    return new Response(
      JSON.stringify({
        users: [{ id: user.id }],
        active: isActive,
        remainingDays: Math.max(0, remainingDays),
        proratedAmount: parseFloat(proratedAmount.toFixed(2)),
        userExists: true,
        hasActiveMembership: isActive
      }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (err) {
    console.error("check-membership-status error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: corsHeaders
    });
  }
});
