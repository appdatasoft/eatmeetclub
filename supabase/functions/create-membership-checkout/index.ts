
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { membershipUtils } from "./membership-utils.ts";
import { stripeOperations } from "./stripe-operations.ts";
import { userOperations } from "./user-operations.ts";

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

    // Get user ID from auth token or email
    let authToken = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
    }
    
    const userId = await userOperations.getUserByEmailOrToken(email, authToken);

    // Check for existing membership
    const existingMembership = await membershipUtils.checkExistingMembership(userId);

    // Calculate appropriate unit amount
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
    const origin = req.headers.get("origin") || frontendUrl;
    
    let unitAmount = 2500;
    if (existingMembership && existingMembership.renewal_at) {
      unitAmount = membershipUtils.calculateProratedAmount(existingMembership, proratedAmount);
    }

    // Create or get Stripe customer
    const customerId = await stripeOperations.findOrCreateCustomer(
      email,
      userId || '',
      name || ''
    );

    // Prepare metadata for Stripe
    const metadata = {
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
    };

    // Create checkout session or payment intent
    const checkoutResult = await stripeOperations.createCheckoutSession(
      customerId,
      email,
      unitAmount,
      metadata,
      { 
        origin,
        redirectToCheckout 
      }
    );

    return new Response(JSON.stringify(checkoutResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
