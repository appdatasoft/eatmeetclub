
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import * as dbOperations from "./db-operations.ts";

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
    const { sessionId, email, eventId } = await req.json();
    console.log("Request received:", { sessionId, email, eventId });
    
    if (!sessionId || !email || !eventId) throw new Error("Missing required fields");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Verify the Stripe session
    console.log("Retrieving session from Stripe:", sessionId);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("Session retrieved:", { 
      status: session.status,
      customerEmail: session.customer_email
    });
    
    if (!session.customer_email || session.customer_email !== email) {
      throw new Error("Email mismatch or missing from session");
    }

    // Step 2: Find or create the user
    console.log("Looking for user with email:", email);
    const { data: userList } = await supabase.auth.admin.listUsers();
    let user = userList.users.find((u) => u.email === email);
    let userId = user?.id;
    let userCreated = false;

    if (!userId) {
      console.log("User not found, creating new user");
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { full_name: email.split('@')[0] }
      });
      
      if (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user: " + error.message);
      }
      
      userId = newUser.user?.id;
      userCreated = true;
      user = newUser.user;
      console.log("New user created with ID:", userId);
      
      // Send password setup link
      try {
        console.log("Sending password setup email");
        await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo: "https://www.eatmeetclub.com/set-password" }
        });
        console.log("Password email sent successfully");
      } catch (emailError) {
        console.error("Error sending password email:", emailError);
        // Don't fail the whole process if just the email fails
      }
    }

    // Step 3: Get payment and distribution details from metadata
    const amount = session.amount_total || 1000;
    console.log("Payment amount:", amount / 100);
    
    // Parse distribution details from session metadata
    const metadata = session.metadata || {};
    const appFee = parseFloat(metadata.appFee || '0');
    const affiliateFee = parseFloat(metadata.affiliateFee || '0');
    const ambassadorFee = parseFloat(metadata.ambassadorFee || '0');
    const restaurantRevenue = parseFloat(metadata.restaurantRevenue || '0');
    
    const affiliateId = metadata.affiliateId || null;
    const ambassadorId = metadata.ambassadorId || null;
    const restaurantId = metadata.restaurantId || null;
    
    console.log("Revenue distribution:", {
      appFee,
      affiliateFee,
      ambassadorFee,
      restaurantRevenue,
      affiliateId,
      ambassadorId,
      restaurantId
    });

    // Step 4: Check for existing ticket
    console.log("Checking for existing ticket");
    const { data: existingTicket } = await supabase
      .from("event_attendees")
      .select("*")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .maybeSingle();
    
    if (existingTicket) {
      console.log("Ticket already exists:", existingTicket.id);
    } else {
      // Step 5: Insert event ticket purchase
      console.log("Creating ticket record");
      const { error: insertError } = await supabase.from("event_attendees").insert({
        user_id: userId,
        event_id: eventId,
        payment_id: sessionId,
        amount: amount / 100,
        status: "confirmed"
      });

      if (insertError) {
        console.error("Failed to record ticket:", insertError);
        throw new Error("Failed to record ticket: " + insertError.message);
      }
      
      console.log("Ticket created successfully");
    }
    
    // Step 6: Update tickets table with final payment status and distribution details
    console.log("Updating tickets record with distribution details");
    const { error: ticketUpdateError } = await supabase
      .from("tickets")
      .update({
        payment_status: "completed",
        app_fee: appFee,
        affiliate_fee: affiliateFee,
        ambassador_fee: ambassadorFee,
        restaurant_revenue: restaurantRevenue,
        affiliate_id: affiliateId,
        payment_completed_at: new Date().toISOString()
      })
      .eq("payment_id", sessionId);
      
    if (ticketUpdateError) {
      console.error("Failed to update ticket with distribution details:", ticketUpdateError);
    }
    
    // Step 7: Update tickets sold count
    const quantity = parseInt(metadata.quantity || '1');
    await dbOperations.incrementTicketsSold(supabase, eventId, quantity);
    
    // Step 8: Record payments to different parties
    console.log("Recording payment distributions");
    
    // Record application fee
    if (appFee > 0) {
      const { error: appFeeError } = await supabase
        .from("payment_distributions")
        .insert({
          ticket_id: sessionId,
          recipient_type: "platform",
          amount: appFee,
          status: "completed"
        });
        
      if (appFeeError) {
        console.error("Failed to record app fee:", appFeeError);
      }
    }
    
    // Record affiliate fee if applicable
    if (affiliateFee > 0 && affiliateId) {
      const { error: affiliateFeeError } = await supabase
        .from("payment_distributions")
        .insert({
          ticket_id: sessionId,
          recipient_type: "affiliate",
          recipient_id: affiliateId,
          amount: affiliateFee,
          status: "pending_payout"
        });
        
      if (affiliateFeeError) {
        console.error("Failed to record affiliate fee:", affiliateFeeError);
      }
    }
    
    // Record ambassador fee
    if (ambassadorFee > 0 && ambassadorId) {
      const { error: ambassadorFeeError } = await supabase
        .from("payment_distributions")
        .insert({
          ticket_id: sessionId,
          recipient_type: "ambassador",
          recipient_id: ambassadorId,
          amount: ambassadorFee,
          status: "pending_payout"
        });
        
      if (ambassadorFeeError) {
        console.error("Failed to record ambassador fee:", ambassadorFeeError);
      }
    }
    
    // Record restaurant revenue
    if (restaurantRevenue > 0 && restaurantId) {
      const { error: restaurantFeeError } = await supabase
        .from("payment_distributions")
        .insert({
          ticket_id: sessionId,
          recipient_type: "restaurant",
          recipient_id: restaurantId,
          amount: restaurantRevenue,
          status: "pending_payout"
        });
        
      if (restaurantFeeError) {
        console.error("Failed to record restaurant revenue:", restaurantFeeError);
      }
    }

    // Step 9: Send ticket confirmation email
    try {
      console.log("Sending ticket confirmation email");
      const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
      const emailResponse = await fetch(`${frontendUrl}/functions/v1/send-ticket-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          email,
          eventId,
          name: user?.user_metadata?.full_name || email.split('@')[0] || "Guest"
        }),
      });
      
      if (emailResponse.ok) {
        console.log("Ticket email sent successfully");
      } else {
        console.error("Failed to send ticket email:", await emailResponse.text());
      }
    } catch (emailError) {
      console.error("Error sending ticket email:", emailError);
      // Don't fail the whole process if just the email fails
    }

    return new Response(JSON.stringify({ 
      success: true,
      userId,
      userCreated,
      eventId,
      paymentId: sessionId,
      distribution: {
        appFee,
        affiliateFee,
        ambassadorFee,
        restaurantRevenue
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in verify-ticket-payment:", err);
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
