
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";

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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Session ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Try to get the receipt URL from different Stripe objects
    let receiptUrl = null;

    try {
      // First, try to retrieve the Checkout Session
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_intent) {
        // If there's a payment intent, get it and then the charge for the receipt
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        
        if (paymentIntent.latest_charge) {
          const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
          receiptUrl = charge.receipt_url;
        }
      } else if (session.subscription) {
        // For subscriptions, get the invoice
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        // Get the most recent invoice for this subscription
        const invoices = await stripe.invoices.list({
          subscription: subscription.id,
          limit: 1,
        });
        
        if (invoices.data.length > 0) {
          receiptUrl = invoices.data[0].hosted_invoice_url;
        }
      }
    } catch (error) {
      console.error("Error retrieving Stripe data:", error);
      // Continue without receipt URL if there's an error
    }

    return new Response(
      JSON.stringify({ 
        receiptUrl,
        success: receiptUrl !== null
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error getting invoice receipt:", error);

    return new Response(
      JSON.stringify({ error: "Failed to get invoice receipt" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
