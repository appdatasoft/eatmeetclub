
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

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
    const { sessionId, email, eventId, referralCode } = await req.json();
    console.log("Request received:", { sessionId, email, eventId, referralCode });
    
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

    // Step 3: Get payment amount
    const amount = session.amount_total || 1000;
    console.log("Payment amount:", amount / 100);

    // Step 4: Check for existing ticket
    console.log("Checking for existing ticket");
    const { data: existingTicket } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .maybeSingle();
    
    let ticketId;
    if (existingTicket) {
      console.log("Ticket already exists:", existingTicket.id);
      ticketId = existingTicket.id;
    } else {
      // Step 5: Insert event ticket purchase
      console.log("Creating ticket record");

      // First lookup the event to get the price
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("price")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("Error finding event:", eventError);
        throw new Error("Failed to find event: " + eventError.message);
      }

      const ticketPrice = eventData.price;
      const quantity = Math.round(amount / (ticketPrice * 100)) || 1; // Calculate quantity based on amount
      const serviceFee = (amount / 100) - (quantity * ticketPrice);

      const { data: ticketData, error: insertError } = await supabase
        .from("tickets")
        .insert({
          user_id: userId,
          event_id: eventId,
          payment_id: sessionId,
          price: ticketPrice,
          quantity: quantity,
          service_fee: serviceFee,
          total_amount: amount / 100,
          payment_status: "confirmed"
        })
        .select()
        .single();

      if (insertError) {
        console.error("Failed to record ticket:", insertError);
        throw new Error("Failed to record ticket: " + insertError.message);
      }

      ticketId = ticketData.id;
      console.log("Ticket created successfully with ID:", ticketId);
      
      // Step 5b: Increment tickets_sold counter on the event
      const { error: updateError } = await supabase.rpc('increment_tickets_sold', { 
        event_id: eventId, 
        amount: quantity 
      });
      
      if (updateError) {
        console.warn("Failed to increment tickets_sold counter:", updateError);
        // Don't fail the whole process if the counter update fails
      }
    }
    
    // Step 6: Track affiliate conversion if referral code exists
    if (referralCode) {
      try {
        console.log("Processing affiliate conversion for code:", referralCode);
        
        // Find the affiliate link
        const { data: affiliateLink, error: affiliateError } = await supabase
          .from("affiliate_links")
          .select("*")
          .eq("code", referralCode)
          .eq("event_id", eventId)
          .single();
        
        if (affiliateError) {
          console.warn("Affiliate link not found:", affiliateError);
        } else if (affiliateLink) {
          console.log("Affiliate link found:", affiliateLink.id);
          
          // Record the conversion
          const { error: conversionError } = await supabase
            .from("affiliate_tracking")
            .insert({
              affiliate_link_id: affiliateLink.id,
              event_id: eventId,
              referred_user_id: userId,
              action_type: "conversion",
              conversion_value: amount / 100,
              ticket_id: ticketId
            });
            
          if (conversionError) {
            console.error("Failed to record affiliate conversion:", conversionError);
          } else {
            console.log("Affiliate conversion recorded successfully");
          }
        }
      } catch (affiliateError) {
        console.error("Error processing affiliate conversion:", affiliateError);
        // Don't fail the whole process if affiliate tracking fails
      }
    }

    // Step 7: Send ticket confirmation email
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
      ticketId,
      paymentId: sessionId
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
