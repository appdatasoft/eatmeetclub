import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { userOperations } from "./user-operations.ts";
import { membershipOperations } from "./membership-operations.ts";
import { emailOperations } from "./email-operations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse the request
    const requestBody = await req.json();
    const { 
      sessionId, 
      email, 
      name, 
      phone = null, 
      address = null, 
      restaurantId = null
    } = requestBody;
    const isSubscription = requestBody.isSubscription !== false; // Default to true
    
    console.log("Request received:", { 
      sessionId, 
      email, 
      isSubscription, 
      restaurantId
    });
    
    if (!sessionId || !email) throw new Error("Missing sessionId or email");

    // Retrieve the session to verify payment
    console.log("Retrieving session from Stripe:", sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session retrieved:", { 
      status: session.status,
      customerEmail: session.customer_email,
      subscriptionId: session.subscription
    });
    
    // Verify email matches
    if (!session.customer_email || session.customer_email !== email) {
      throw new Error("Email mismatch or missing from session");
    }

    // Step 1: Find or create the user
    const { userId, isNewUser, passwordEmailSent } = await userOperations.findOrCreateUser(
      email, 
      name, 
      phone, 
      address, 
      {
        forceCreateUser: requestBody.forceCreateUser !== false,
        sendPasswordEmail: requestBody.sendPasswordEmail !== false
      }
    );

    // Step 2: Check for existing membership for this restaurant if restaurantId provided
    const existingMembership = await membershipOperations.checkExistingMembership(
      userId, 
      restaurantId
    );
    
    // If we're doing a simplified verification, just return success
    if (requestBody.simplifiedVerification === true) {
      console.log("Running in simplified verification mode");
      return new Response(JSON.stringify({
        success: true,
        simplifiedVerification: true,
        invoiceEmailNeeded: true,
        membershipChecked: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Don't create a new membership if one already exists (unless in safe mode)
    let membershipCreated = false;
    if (existingMembership && requestBody.safeMode !== true) {
      console.log("Active membership already exists:", existingMembership.id);
    } else if (requestBody.createMembershipRecord !== false) {
      const subscriptionId = session.subscription;
      const amount = session.amount_total || 2500;
      
      // Get product ID from Stripe if possible
      let productId = null;
      if (session.line_items) {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        if (lineItems.data.length > 0 && lineItems.data[0].price?.product) {
          // If product is a string (ID), use it directly
          if (typeof lineItems.data[0].price.product === 'string') {
            productId = lineItems.data[0].price.product;
          } 
          // Otherwise extract ID from product object
          else if (lineItems.data[0].price.product.id) {
            productId = lineItems.data[0].price.product.id;
          }
        }
      }
      
      // Create membership record
      const membership = await membershipOperations.createMembership(
        userId, 
        subscriptionId, 
        sessionId,
        restaurantId,
        productId
      );
      membershipCreated = true;
      
      // Record payment
      await membershipOperations.recordPayment(membership.id, sessionId, amount / 100);
    }

    // Send invoice email if requested
    let invoiceEmailSent = false;
    if (requestBody.sendInvoiceEmail !== false) {
      invoiceEmailSent = await emailOperations.sendInvoiceEmail(
        sessionId, 
        email, 
        name || "Member",
        {
          preventDuplicates: requestBody.preventDuplicateEmails !== false,
          forceSend: requestBody.forceSendEmails === true
        }
      );
    }

    return new Response(JSON.stringify({
      success: true,
      userId,
      membershipCreated,
      passwordEmailSent,
      invoiceEmailSent,
      restaurantId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in verify-membership-payment:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
