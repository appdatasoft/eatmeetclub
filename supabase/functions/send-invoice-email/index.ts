
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { sendTicketInvoiceEmail } from "./ticket-invoice.ts";
import { sendMembershipInvoiceEmail } from "./membership-invoice.ts";

// Track sent emails to prevent duplicates within an execution context
const sentEmails = new Map<string, Date>();

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
    
    const { sessionId, email, name, eventDetails, preventDuplicate = false } = await req.json();
    
    if (!sessionId) throw new Error("No session ID provided");
    if (!email) throw new Error("No email provided");
    
    // Check for duplicate sends if prevention is requested
    const cacheKey = `${email}:${sessionId}`;
    if (preventDuplicate && sentEmails.has(cacheKey)) {
      const lastSent = sentEmails.get(cacheKey);
      const timeSince = new Date().getTime() - lastSent!.getTime();
      
      // If we've sent this email in the last 60 seconds, don't send again
      if (timeSince < 60000) {
        console.log(`Preventing duplicate email to ${email} for session ${sessionId} (sent ${timeSince}ms ago)`);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Email already sent recently, skipped duplicate",
            duplicate: true
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }
    
    console.log("Sending invoice email for session:", sessionId);
    console.log("Email recipient:", email);
    console.log("User name:", name);
    console.log("Event details received:", JSON.stringify(eventDetails, null, 2));

    // Record this send attempt to prevent duplicates
    sentEmails.set(cacheKey, new Date());

    // Determine the type of invoice to generate based on whether eventDetails is provided
    // If eventDetails is provided, it's a ticket purchase invoice
    // Otherwise, it's a membership invoice
    if (eventDetails) {
      console.log("Generating ticket invoice email");
      return await sendTicketInvoiceEmail({ sessionId, email, name, eventDetails });
    } else {
      console.log("Generating membership invoice email");
      return await sendMembershipInvoiceEmail({ sessionId, email, name });
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
