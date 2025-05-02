
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
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
    // Parse the request body to get user details
    const { 
      email, 
      name, 
      phone, 
      address, 
      redirectToCheckout, 
      createUser, 
      sendPasswordEmail, 
      sendInvoiceEmail 
    } = await req.json();
    
    if (!email) throw new Error("No email provided");

    console.log("Creating checkout session for:", { 
      email, 
      name, 
      phone, 
      address, 
      redirectToCheckout,
      createUser,
      sendPasswordEmail,
      sendInvoiceEmail
    });

    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    
    // Extract the user's authToken if present (optional)
    let authToken = null;
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authToken = authHeader.substring(7);
      console.log("Auth token received");
      
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser(authToken);
        if (!userError && userData?.user) {
          userId = userData.user.id;
          console.log("User authenticated:", userId);
        } else {
          console.log("Token validation failed:", userError?.message);
        }
      } catch (error) {
        console.error("Error validating token:", error.message);
      }
    } else {
      console.log("No auth token provided - proceeding with guest checkout");
    }

    // Get origin from request or use a default value
    const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
    const origin = req.headers.get("origin") || frontendUrl;
    console.log("Using origin for redirects:", origin);

    // If redirectToCheckout is true, create a Stripe checkout session
    if (redirectToCheckout) {
      // Create a customer if they don't exist
      const customers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      let customerId;
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        console.log("Using existing Stripe customer:", customerId);
      } else {
        const customer = await stripe.customers.create({
          email: email,
          name: name || '',
          metadata: {
            user_id: userId || '',
            create_user: createUser ? 'true' : 'false',
            send_password_email: sendPasswordEmail ? 'true' : 'false',
            send_invoice_email: sendInvoiceEmail ? 'true' : 'false'
          }
        });
        customerId = customer.id;
        console.log("Created new Stripe customer:", customerId);
      }

      // Create checkout session with billing address and phone collection
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
              unit_amount: 2500, // $25.00 in cents
              recurring: {
                interval: 'month',
              },
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
          email: email,
          user_id: userId || '',
          create_user: createUser ? 'true' : 'false',
          send_password_email: sendPasswordEmail ? 'true' : 'false',
          send_invoice_email: sendInvoiceEmail ? 'true' : 'false'
        },
        // Add settings to collect additional information
        billing_address_collection: 'required',
        phone_number_collection: {
          enabled: true,
        },
      });

      console.log("Checkout session created:", { 
        id: session.id, 
        url: session.url ? 'exists' : 'undefined' 
      });

      return new Response(
        JSON.stringify({
          success: true,
          url: session.url,
          sessionId: session.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // Otherwise create a PaymentIntent or SetupIntent (previous behavior)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 2500, // $25.00 in cents
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          name: name || '',
          phone: phone || '',
          address: address || '',
          email: email,
          is_subscription: 'true',
          user_id: userId || '',
          create_user: createUser ? 'true' : 'false',
          send_password_email: sendPasswordEmail ? 'true' : 'false',
          send_invoice_email: sendInvoiceEmail ? 'true' : 'false'
        },
        receipt_email: email,
        setup_future_usage: 'off_session', // For future subscription payments
      });

      console.log("Payment intent created:", { id: paymentIntent.id, client_secret: paymentIntent.client_secret ? 'exists' : 'undefined' });

      return new Response(
        JSON.stringify({
          success: true,
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
    
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
