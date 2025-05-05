
import { Resend } from "npm:resend@1.0.0";
import { corsHeaders } from "./utils.ts";
import { generateMembershipInvoiceEmail } from "./email-templates/membership-template.ts";
import { stripe } from "../_shared/stripe.ts";

export async function sendMembershipInvoiceEmail({ 
  sessionId, 
  email, 
  name 
}: { 
  sessionId: string, 
  email: string, 
  name: string 
}) {
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  
  try {
    console.log("Retrieving payment info for session:", sessionId);
    
    // First try to get direct session
    let session;
    let amount = 25.00; // Default
    let status = "succeeded";
    let created = new Date().toISOString();
    let receiptUrl = "";
    let interval = "month";
    
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      amount = ((session.amount_total || 2500) / 100);
      created = new Date(session.created * 1000).toISOString();
      
      // Try to determine if this is a subscription or one-time payment
      if (session.mode === 'subscription' && session.subscription) {
        interval = "month";
        
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        status = subscription.status;
        
        // Get receipt/invoice
        const invoices = await stripe.invoices.list({
          subscription: subscription.id,
          limit: 1,
        });
        
        if (invoices.data.length > 0) {
          receiptUrl = invoices.data[0].hosted_invoice_url || "";
        }
      } else {
        // For one-time payment
        interval = "one-time";
        if (session.payment_intent) {
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          status = paymentIntent.status;
          
          if (paymentIntent.latest_charge) {
            const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
            receiptUrl = charge.receipt_url || "";
          }
        }
      }
    } catch (stripeError) {
      console.error("Error retrieving Stripe data:", stripeError);
      // Continue with defaults if there's an error
    }
    
    console.log("Preparing email with details:", {
      amount,
      interval,
      status,
      created,
      receiptUrl: receiptUrl ? "Available" : "Not available"
    });
    
    // Generate email HTML content
    const emailHtml = generateMembershipInvoiceEmail(name, {
      amount,
      interval,
      status,
      created,
      receiptUrl
    });
    
    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Eat Meet Club <notifications@eatmeetclub.com>",
      to: [email],
      subject: "Your Eat Meet Club Membership Receipt",
      html: emailHtml,
    });
    
    console.log("Membership receipt email sent successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: emailResponse.data?.id || null,
        receiptUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending membership invoice email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}
