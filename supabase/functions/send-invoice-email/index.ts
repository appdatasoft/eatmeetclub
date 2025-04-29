import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { Resend } from "npm:resend@1.0.0";

// Initialize Resend with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not set!");
}

const resend = new Resend(resendApiKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    console.log("Invoice email function called");
    
    const { sessionId, email, name } = await req.json();
    
    if (!sessionId) throw new Error("No session ID provided");
    if (!email) throw new Error("No email provided");
    
    console.log("Sending invoice email for session:", { sessionId, email, name });

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
    const invoiceHtml = generateInvoiceEmail(name || "Member", invoiceDetails);
    
    // Send the email
    console.log("Sending email via Resend to:", email);
    try {
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY is not configured");
      }
      
      const emailResponse = await resend.emails.send({
        from: "Eat Meet Club <onboarding@resend.dev>", // Update with your verified domain in production
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
  } catch (error) {
    console.error("Error in send-invoice-email function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
        error: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateInvoiceEmail(name: string, invoiceDetails: {
  amount: number;
  interval: string;
  status: string;
  created: string;
  receiptUrl: string;
}) {
  const date = new Date(invoiceDetails.created);
  const formattedDate = `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Eat Meet Club Membership Invoice</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
      }
      .container {
        padding: 20px;
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #B5642A;
        margin-bottom: 5px;
      }
      .invoice-box {
        border: 1px solid #eee;
        padding: 20px;
        border-radius: 5px;
        background-color: #f9f9f9;
      }
      .invoice-details {
        margin-bottom: 20px;
      }
      .invoice-details table {
        width: 100%;
        border-collapse: collapse;
      }
      .invoice-details th,
      .invoice-details td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      .total {
        font-weight: bold;
        font-size: 1.1em;
      }
      .footer {
        margin-top: 30px;
        text-align: center;
        font-size: 0.9em;
        color: #777;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #B5642A;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin-top: 15px;
      }
      .status {
        padding: 5px 10px;
        border-radius: 15px;
        display: inline-block;
        font-size: 0.8em;
        color: white;
        background-color: ${invoiceDetails.status === 'succeeded' || invoiceDetails.status === 'active' ? '#28a745' : '#ffc107'};
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Eat Meet Club</h1>
        <p>Membership Invoice</p>
      </div>
      
      <div class="invoice-box">
        <div class="invoice-details">
          <p><strong>Invoice Date:</strong> ${formattedDate}</p>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Status:</strong> <span class="status">${invoiceDetails.status === 'succeeded' || invoiceDetails.status === 'active' ? 'Paid' : invoiceDetails.status}</span></p>
          
          <table>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
            <tr>
              <td>Eat Meet Club Membership (${invoiceDetails.interval === 'month' ? 'Monthly' : 'One-time'})</td>
              <td>$${invoiceDetails.amount.toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td>Total</td>
              <td>$${invoiceDetails.amount.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center;">
          ${invoiceDetails.receiptUrl ? `<a href="${invoiceDetails.receiptUrl}" class="button" target="_blank">View Receipt</a>` : ''}
        </div>
      </div>
      
      <div class="footer">
        <p>Thank you for your membership! We're excited to have you join our community.</p>
        <p>For any questions about your invoice, please contact us at support@eatmeetclub.com</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
