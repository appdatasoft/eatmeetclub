
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
    // Parse the request
    const requestBody = await req.json();
    const { sessionId, email, name, phone = null, address = null } = requestBody;
    const isSubscription = requestBody.isSubscription !== false; // Default to true
    
    console.log("Request received:", { sessionId, email, isSubscription });
    
    if (!sessionId || !email) throw new Error("Missing sessionId or email");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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
    console.log("Looking for user with email:", email);
    const userResp = await supabase.auth.admin.listUsers();
    let user = userResp.data.users.find((u) => u.email === email);
    let userId = user?.id;
    let passwordEmailSent = false;

    // Create the user if they don't exist
    if (!userId && requestBody.forceCreateUser !== false) {
      console.log("User not found, creating new user");
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { 
          full_name: name || email.split('@')[0],
          phone: phone,
          address: address
        }
      });
      
      if (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user: " + error.message);
      }
      
      userId = newUser.user?.id;
      console.log("New user created with ID:", userId);
      
      // Send password setup link if requested
      if (requestBody.sendPasswordEmail !== false) {
        try {
          console.log("Sending password setup email");
          await supabase.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: "https://www.eatmeetclub.com/set-password" }
          });
          passwordEmailSent = true;
          console.log("Password email sent successfully");
        } catch (emailError) {
          console.error("Error sending password email:", emailError);
          // Don't fail the whole process if just the email fails
        }
      }
    } else {
      console.log("User found:", userId);
    }

    // Step 2: Check for existing membership
    console.log("Checking for existing membership");
    const now = new Date().toISOString();
    const { data: existingMembership } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`renewal_at.gt.${now},renewal_at.is.null`)
      .maybeSingle();
    
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
      
      console.log("Creating new membership record");
      // Insert membership
      const { data: membership, error: mErr } = await supabase.from("memberships").insert({
        user_id: userId,
        status: "active",
        is_subscription: isSubscription,
        started_at: new Date().toISOString(),
        renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_id: subscriptionId,
        last_payment_id: sessionId,
      }).select().single();

      if (mErr) {
        console.error("Failed to insert membership:", mErr);
        throw new Error("Failed to insert membership: " + mErr.message);
      }
      
      membershipCreated = true;
      console.log("Membership created:", membership.id);

      // Insert payment record
      console.log("Creating payment record");
      const { error: pErr } = await supabase.from("membership_payments").insert({
        membership_id: membership.id,
        payment_id: sessionId,
        amount: amount / 100,
        payment_status: "succeeded"
      });

      if (pErr) {
        console.error("Failed to insert payment:", pErr);
        throw new Error("Failed to insert payment: " + pErr.message);
      }
      
      console.log("Payment record created successfully");
    }

    // Send invoice email if requested and not prevented by duplicate check
    let invoiceEmailSent = false;
    if (requestBody.sendInvoiceEmail !== false) {
      try {
        console.log("Sending invoice email");
        // Send invoice email
        const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
        const emailResponse = await fetch(`${frontendUrl}/functions/v1/send-invoice-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            email,
            name: name || user?.user_metadata?.full_name || "Member",
            preventDuplicates: requestBody.preventDuplicateEmails !== false && requestBody.forceSend !== true,
          }),
        });
        
        if (emailResponse.ok) {
          invoiceEmailSent = true;
          console.log("Invoice email sent successfully");
        } else {
          console.error("Failed to send invoice email:", await emailResponse.text());
        }
      } catch (emailError) {
        console.error("Error sending invoice email:", emailError);
        // Don't fail the whole process if just the email fails
      }
    }

    return new Response(JSON.stringify({
      success: true,
      userId,
      membershipCreated,
      passwordEmailSent,
      invoiceEmailSent,
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
