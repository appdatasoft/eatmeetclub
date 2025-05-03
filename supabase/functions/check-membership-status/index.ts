
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { stripe } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    const { email, name } = await req.json();
    if (!email || !name) throw new Error("Missing email or name");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Check if user exists
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList.users.find((u) => u.email === email);
    let userId = user?.id;

    // Step 2: Create user if not exists
    if (!userId) {
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { full_name: name }
      });
      if (error) throw new Error("Error creating user: " + error.message);
      userId = newUser.user?.id;

      // Send password setup link
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo: "https://www.eatmeetclub.com/set-password" }
      });
    }

    // Step 3: Check membership status
    const now = new Date().toISOString();
    const { data: membership } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`renewal_at.gt.${now},renewal_at.is.null`)
      .maybeSingle();

    if (membership) {
      return new Response(JSON.stringify({
        success: true,
        activeMembership: true,
        message: "User already has active membership"
      }), { headers: corsHeaders });
    }

    // Step 4: Get price from admin config (e.g., monthly $25)
    const priceCents = 2500; // Replace with DB fetch if needed

    // Step 5: Create Stripe Checkout
    const customer = await stripe.customers.create({ email, name });
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Monthly Membership' },
            unit_amount: priceCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://www.eatmeetclub.com/membership-payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://www.eatmeetclub.com/membership-payment?canceled=true`,
    });

    return new Response(JSON.stringify({
      success: true,
      activeMembership: false,
      checkoutUrl: session.url
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
