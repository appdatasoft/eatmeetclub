
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Check if user exists
    const { data: users, error: userError } = await supabaseClient.auth.admin.listUsers({
      filter: {
        email: email,
      },
      page: 1,
      perPage: 1,
    });

    if (userError) {
      console.error("Error fetching user:", userError);
      return new Response(
        JSON.stringify({ error: "Failed to check user status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const user = users.users.length > 0 ? users.users[0] : null;
    const userExists = !!user;
    let hasActiveMembership = false;
    let membershipData = null;
    let productInfo = null;

    // If user exists, check for active membership
    if (user) {
      const userId = user.id;
      const { data: membership, error: membershipError } = await supabaseClient
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (membershipError) {
        console.error("Error fetching membership:", membershipError);
      }

      if (membership) {
        hasActiveMembership = true;
        membershipData = membership;

        // If product_id is available, fetch product information
        if (membership.product_id) {
          const { data: product, error: productError } = await supabaseClient
            .from('products')
            .select('name, description')
            .eq('stripe_product_id', membership.product_id)
            .maybeSingle();

          if (!productError && product) {
            productInfo = product;
          } else if (productError) {
            console.error("Error fetching product:", productError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        userExists,
        active: hasActiveMembership,
        hasActiveMembership,
        users: userExists ? [{ id: user.id, email: user.email }] : [],
        membership: membershipData,
        productInfo
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error checking membership status:", error);

    return new Response(
      JSON.stringify({ error: "Failed to check membership status" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
