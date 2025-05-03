
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

    // Step 3: Get payment amount
    const amount = session.amount_total || 1000;
    console.log("Payment amount:", amount / 100);

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

    // Step 6: Send ticket confirmation email
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
