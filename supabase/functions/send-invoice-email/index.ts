
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { Resend } from "npm:resend@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const { sessionId, email, name } = await req.json();
    
    if (!sessionId) throw new Error("No session ID provided");
    if (!email) throw new Error("No email provided");
    
    console.log("Sending invoice email for session:", { sessionId, email, name });

    // Retrieve the session from Stripe to get payment details
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Get subscription details if it's a subscription
    let invoiceDetails = {
      amount: 0,
      interval: "month",
      status: "unknown",
      created: new Date().toISOString(),
      receiptUrl: session.success_url || ""
    };
    
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string);
      
      invoiceDetails = {
        amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
        interval: subscription.items.data[0]?.plan.interval || "month",
        status: subscription.status,
        created: new Date(subscription.created * 1000).toISOString(),
        receiptUrl: invoice.hosted_invoice_url || ""
      };
    } else if (session.payment_intent) {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
      
      invoiceDetails = {
        amount: (paymentIntent.amount || 0) / 100,
        interval: "one-time",
        status: paymentIntent.status,
        created: new Date(paymentIntent.created * 1000).toISOString(),
        receiptUrl: paymentIntent.charges.data[0]?.receipt_url || ""
      };
    }
    
    // Generate the invoice email HTML
    const invoiceHtml = generateInvoiceEmail(name || "Member", invoiceDetails);
    
    // Send the email
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
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending invoice email:", error.message);
    
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
