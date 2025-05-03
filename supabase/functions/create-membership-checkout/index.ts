// create-membership-checkout.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, cache-control",
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
    const {
      email,
      name,
      phone,
      address,
      redirectToCheckout,
      createUser,
      sendPasswordEmail,
      sendInvoiceEmail,
      proratedAmount
    } = await req.json();

    if (!email) throw new Error("No email provided");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let authToken = null;
    let userId = null;
    const authHeader = req.headers.get('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(authToken);
        if (!userError && userData?.user) {
          userId = userData.user.id;
        }
      } catch {}
    }

    // STEP 1: Get user by email
    const { data: userList } = await supabaseClient.auth.admin.listUsers();
    const user = userList.users.find((u) => u.email === email);
    userId = user?.id || userId;

    // STEP 2: Check membership
    let existingMembership = null;
    try {
      const now = new Date();
      const { data } = await supabaseClient
        .from('memberships')
        .select(`id, status, is_subscription, started_at, renewal_at, subscription_id, user_id`)
        .eq('user_id', userId || '')
        .eq('status', 'active')
        .or(`renewal_at.gt.${now.toISOString()},renewal_at.is.null`)
        .maybeSingle();

      if (data) {
        existingMembership = data;
      }
    } catch {}

    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
    const origin = req.headers.get("origin") || frontendUrl;

    let unitAmount = 2500;
    if (existingMembership && existingMembership.renewal_at) {
      if (!proratedAmount) {
        const now = new Date();
        const elapsedMs = now.getTime() - new Date(existingMembership.started_at).getTime();
        const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
        const remainingDays = 30 - elapsedDays;
        if (remainingDays <= 0) unitAmount = 2500;
        else if (remainingDays < 15) unitAmount = 1250;
        else throw new Error("Active membership exists with >15 days remaining");
      } else {
        unitAmount = Math.round(proratedAmount * 100);
      }
    }

    // STEP 3: Stripe Checkout
    if (redirectToCheckout) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      let customerId = customers.data.length ? customers.data[0].id : null;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email,
          name: name || '',
          metadata: {
            user_id: userId || '',
            create_user: createUser ? 'true' : 'false',
            send_password_email: sendPasswordEmail ? 'true' : 'false',
            send_invoice_email: sendInvoiceEmail ? 'true' : 'false'
          }
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Membership',
                description: 'Access to exclusive dining experiences',
              },
              unit_amount: unitAmount,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/membership-payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/membership-payment?canceled=true`,
        metadata: {
          name: name || '',
          phone: phone || '',
          address: address || '',
          email,
          user_id: userId || '',
          create_user: createUser ? 'true' : 'false',
          send_password_email: sendPasswordEmail ? 'true' : 'false',
          send_invoice_email: sendInvoiceEmail ? 'true' : 'false',
          existing_membership: existingMembership ? 'true' : 'false',
          prorated_amount: unitAmount.toString()
        },
        billing_address_collection: 'required',
        phone_number_collection: { enabled: true },
      });

      return new Response(JSON.stringify({
        success: true,
        url: session.url,
        sessionId: session.id,
        isProrated: unitAmount !== 2500,
        unitAmount: unitAmount / 100
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: unitAmount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          name: name || '',
          phone: phone || '',
          address: address || '',
          email,
          is_subscription: 'true',
          user_id: userId || '',
          create_user: createUser ? 'true' : 'false',
          send_password_email: sendPasswordEmail ? 'true' : 'false',
          send_invoice_email: sendInvoiceEmail ? 'true' : 'false',
          existing_membership: existingMembership ? 'true' : 'false',
          prorated_amount: unitAmount.toString()
        },
        receipt_email: email,
        setup_future_usage: 'off_session',
      });

      return new Response(JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        isProrated: unitAmount !== 2500,
        unitAmount: unitAmount / 100
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
