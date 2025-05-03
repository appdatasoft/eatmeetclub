
// supabase/functions/check-membership-status/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const { data: membership, error } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_email", email)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: corsHeaders
      });
    }

    if (!membership) {
      return new Response(
        JSON.stringify({
          active: false,
          remainingDays: 0,
          proratedAmount: null
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    const isActive = membership?.status === "active" && new Date(membership.expires_at) > new Date();

    // Get membership fee from admin_config
    const { data: config } = await supabase
      .from("admin_config")
      .select("membership_fee")
      .single();

    const monthlyFee = config?.membership_fee || 25;

    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysRemaining = Math.max(0, Math.ceil((lastDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const daysInMonth = lastDay.getDate();

    const proratedAmount = isActive ? 0 : parseFloat(((monthlyFee * daysRemaining) / daysInMonth).toFixed(2));

    return new Response(
      JSON.stringify({
        active: isActive,
        remainingDays: daysRemaining,
        proratedAmount
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};