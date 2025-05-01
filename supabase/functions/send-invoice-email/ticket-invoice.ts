
import { stripe } from "../_shared/stripe.ts";
import { corsHeaders, resend, parseAndFormatDate, safeParseFloat, safeParseInt } from "./utils.ts";
import { generateTicketInvoiceEmail } from "./email-templates/ticket-template.ts";

export async function sendTicketInvoiceEmail({ sessionId, email, name, eventDetails }) {
  try {
    console.log("Generating ticket invoice for:", { sessionId, email, name });
    console.log("Event details:", JSON.stringify(eventDetails, null, 2));
    
    // Retrieve the session from Stripe to get payment details
    console.log("Retrieving Stripe session:", sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log("Stripe session retrieved:", {
      id: session.id,
      status: session.status,
      hasPaymentIntent: !!session.payment_intent
    });
    
    // Get payment intent details
    let receiptUrl = "";
    let paymentDate = new Date().toISOString();
    
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        if (paymentIntent && paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data[0]) {
          receiptUrl = paymentIntent.charges.data[0].receipt_url || "";
        }
        paymentDate = new Date(paymentIntent.created * 1000).toISOString();
      } catch (err) {
        console.error("Error retrieving payment intent:", err);
        // Continue without receipt URL if there's an error
      }
    }
    
    // Format the event date
    const formattedEventDate = parseAndFormatDate(eventDetails.date);
    
    // Format the payment date
    const paymentDateFormatted = new Date(paymentDate).toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
    
    // Get price values, ensuring they are numbers
    const unitPrice = safeParseFloat(eventDetails.price);
    const quantity = safeParseInt(eventDetails.quantity, 1);
    const serviceFee = safeParseFloat(eventDetails.service_fee);
    const totalAmount = safeParseFloat(eventDetails.total_amount, (unitPrice * quantity + serviceFee));
    
    console.log("Invoice values:", {
      unitPrice,
      quantity,
      serviceFee,
      totalAmount,
      formattedEventDate,
      paymentDateFormatted
    });
    
    // Extract restaurant information safely
    const restaurantName = eventDetails.restaurant?.name || "Venue";
    const restaurantAddress = eventDetails.restaurant?.address || "";
    const restaurantCity = eventDetails.restaurant?.city || "";
    const eventLocation = `${restaurantName}${restaurantAddress ? ', ' + restaurantAddress : ''}${restaurantCity ? ', ' + restaurantCity : ''}`;
    
    // Generate the ticket invoice email HTML
    const invoiceHtml = generateTicketInvoiceEmail({
      name: name || "Member",
      eventTitle: eventDetails.title || "Event",
      eventDate: formattedEventDate,
      eventTime: eventDetails.time || "",
      eventLocation,
      quantity,
      unitPrice,
      serviceFee,
      total: totalAmount,
      purchaseDate: paymentDateFormatted,
      receiptUrl
    });
    
    // Send the email
    console.log("Sending email via Resend to:", email);
    try {
      if (!resend) {
        throw new Error("RESEND_API_KEY is not configured");
      }
      
      console.log("Email content prepared, sending now...");
      const emailResponse = await resend.emails.send({
        from: "Eat Meet Club <sumi@eatmeetclub.com>", // Updated from email address
        to: email,
        subject: "Your Eat Meet Club Event Tickets",
        html: invoiceHtml,
      });
      
      console.log("Ticket email sent:", emailResponse);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Ticket invoice email sent successfully",
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
    console.error("Error in sendTicketInvoiceEmail:", error);
    throw error;
  }
}
