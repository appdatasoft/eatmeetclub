import { serve } from "https://deno.land/std/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, description, price_cents, interval = "month" } = await req.json();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2022-11-15",
    });

    // 1. Create Stripe product
    const product = await stripe.products.create({
      name,
      description,
    });

    // 2. Create Stripe price
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: price_cents,
      currency: "usd",
      recurring: { interval },
    });

    // 3. Save to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase.from("products").insert([
      {
        name,
        description,
        price_cents,
        interval,
        stripe_product_id: product.id,
        stripe_price_id: price.id,
      },
    ]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, product_id: product.id, price_id: price.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("❌ Stripe product creation error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Unexpected error", success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
