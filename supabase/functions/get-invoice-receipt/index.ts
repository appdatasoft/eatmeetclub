
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse the request body to get session ID
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("No session ID provided");
    }
    
    console.log("Getting invoice receipt for session:", sessionId);
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session retrieved:", {
      id: session.id,
      hasSubscription: !!session.subscription,
      hasPaymentIntent: !!session.payment_intent
    });
    
    let receiptUrl = null;
    
    // Get the receipt URL based on session type
    if (session.subscription) {
      console.log("Processing subscription payment");
      const subscriptionId = session.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
      receiptUrl = invoice.hosted_invoice_url || null;
    } else if (session.payment_intent) {
      console.log("Processing one-time payment");
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
      receiptUrl = paymentIntent.charges?.data[0]?.receipt_url || null;
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        receiptUrl
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in get-invoice-receipt function:", error);
    
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
