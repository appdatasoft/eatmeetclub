
import { stripe } from "../_shared/stripe.ts";
import { corsHeaders, resend } from "./utils.ts";
import { generateMembershipInvoiceEmail } from "./email-templates/membership-template.ts";

export async function sendMembershipInvoiceEmail({ sessionId, email, name }) {
  // Retrieve the session from Stripe to get payment details
  console.log("Retrieving Stripe session:", sessionId);
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  console.log("Stripe session retrieved:", {
    id: session.id,
    status: session.status,
    hasSubscription: !!session.subscription,
    hasPaymentIntent: !!session.payment_intent
  });
  
  // Get subscription details if it's a subscription
  let invoiceDetails = {
    amount: 0,
    interval: "month",
    status: "unknown",
    created: new Date().toISOString(),
    receiptUrl: session.success_url || ""
  };
  
  if (session.subscription) {
    console.log("Processing subscription payment");
    const subscriptionId = session.subscription as string;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
    
    invoiceDetails = {
      amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
      interval: subscription.items.data[0]?.plan.interval || "month",
      status: subscription.status,
      created: new Date(subscription.created * 1000).toISOString(),
      receiptUrl: invoice.hosted_invoice_url || ""
    };
    
    console.log("Subscription invoice details:", invoiceDetails);
  } else if (session.payment_intent) {
    console.log("Processing one-time payment");
    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
    
    invoiceDetails = {
      amount: (paymentIntent.amount || 0) / 100,
      interval: "one-time",
      status: paymentIntent.status,
      created: new Date(paymentIntent.created * 1000).toISOString(),
      receiptUrl: paymentIntent.charges.data[0]?.receipt_url || ""
    };
    
    console.log("One-time payment invoice details:", invoiceDetails);
  }
  
  // Generate the invoice email HTML
  const invoiceHtml = generateMembershipInvoiceEmail(name || "Member", invoiceDetails);
  
  // Send the email
  console.log("Sending email via Resend to:", email);
  try {
    if (!resend) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    
    const emailResponse = await resend.emails.send({
      from: "Eat Meet Club <sumi@eatmeetclub.com>", // Updated from email address
      to: email,
      subject: "Your Eat Meet Club Membership Invoice",
      html: invoiceHtml,
    });
    
    console.log("Email sent:", emailResponse);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Invoice email sent successfully",
        data: emailResponse
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (emailError) {
    console.error("Error sending email via Resend:", emailError);
    throw emailError;
  }
}
