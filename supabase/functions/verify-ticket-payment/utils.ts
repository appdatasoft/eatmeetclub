
import { stripe } from "../_shared/stripe.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function verifyTicketSession(sessionId: string) {
  // Retrieve the checkout session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (!session) {
    throw new Error('Invalid session ID');
  }
  
  // Verify payment status
  if (session.payment_status !== 'paid') {
    throw new Error(`Payment not completed. Status: ${session.payment_status}`);
  }
  
  return {
    session,
    metadata: session.metadata || {}
  };
}

export async function sendInvoiceEmail(authHeader: string, sessionId: string, user: any, eventDetails: any, ticketData: any) {
  let emailSent = false;
  
  try {
    console.log(`Sending ticket invoice email for session ${sessionId} to ${user.email}`);
    
    // Get user's name from metadata
    const userName = user.user_metadata?.name || user.user_metadata?.full_name || 'Member';
    console.log(`User name for email: ${userName}`);
    
    // Use direct fetch to send email to avoid cross-function issues
    const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-invoice-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader
      },
      body: JSON.stringify({
        sessionId,
        email: user.email,
        name: userName,
        eventDetails: {
          ...eventDetails,
          ...ticketData,
          restaurant: eventDetails.restaurant
        }
      }),
    });
    
    console.log("Email API response status:", emailResponse.status);
    
    if (!emailResponse.ok) {
      const responseText = await emailResponse.text();
      console.error("Error response from invoice email function:", responseText);
      throw new Error(`Invoice email API returned error: ${responseText}`);
    } else {
      const responseData = await emailResponse.json();
      console.log("Email API response data:", responseData);
      emailSent = true;
    }
  } catch (invoiceError) {
    console.error("Error sending ticket invoice email:", invoiceError);
    // Don't fail the whole process if the invoice email fails
  }
  
  return emailSent;
}
