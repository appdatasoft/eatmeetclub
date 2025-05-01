
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { stripe } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

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
    // Parse the request body to get the payment ID and user details
    const { paymentId, email, name, phone, isSubscription = false } = await req.json();
    if (!paymentId) throw new Error("No payment ID provided");
    if (!email) throw new Error("No email provided");
    if (!name) throw new Error("No name provided");

    console.log("Verifying payment:", { paymentId, email, name, isSubscription });

    // Create Supabase client with service role key to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if user already exists
    const { data: existingUser, error: checkUserError } = await supabaseClient.auth.admin.listUsers({
      filter: `email eq "${email}"`,
    });

    let userId;
    let password;
    
    if (checkUserError) {
      console.error("Error checking if user exists:", checkUserError.message);
      throw new Error(`Error checking if user exists: ${checkUserError.message}`);
    }
    
    console.log("Existing user check result:", existingUser);
    
    // If user doesn't exist in auth.users, create them
    if (!existingUser.users || existingUser.users.length === 0) {
      console.log("User does not exist, creating new user");
      // Generate a random password for the new user
      password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          full_name: name,
          phone: phone || null,
        }
      });

      if (userError) {
        throw new Error(`Error creating user: ${userError.message}`);
      }

      userId = userData.user.id;
      console.log("User created successfully:", userId);
    } else {
      userId = existingUser.users[0].id;
      console.log("User already exists, using existing user ID:", userId);
    }

    // Verify the payment with Stripe
    let paymentVerified = false;
    let sessionId = paymentId;
    let subscriptionId = null;
    let amountPaid = 2500; // Default $25 in cents
    
    try {
      if (isSubscription) {
        const session = await stripe.checkout.sessions.retrieve(paymentId);
        subscriptionId = session.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          paymentVerified = subscription.status === 'active';
          console.log("Subscription verified:", { subscriptionId, status: subscription.status });
          
          // Get the price from the subscription
          if (subscription.items.data.length > 0) {
            amountPaid = subscription.items.data[0].price.unit_amount || 2500;
          }
        } else {
          throw new Error("No subscription ID found in session");
        }
      } else {
        // For one-time payment
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        paymentVerified = paymentIntent.status === "succeeded";
        amountPaid = paymentIntent.amount;
        console.log("One-time payment verified:", { status: paymentIntent.status, amount: paymentIntent.amount });
      }
    } catch (error) {
      console.error("Payment verification error:", error.message);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
    
    if (!paymentVerified) {
      throw new Error("Payment verification failed");
    }
    
    // Check if the user already has an active membership
    const { data: existingMembership, error: membershipCheckError } = await supabaseClient
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
      
    if (membershipCheckError) {
      console.error("Error checking existing membership:", membershipCheckError);
      // Continue anyway, since we want to create a new membership if needed
    }
    
    // Create or update membership record
    const renewalDate = isSubscription ? 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days from now for subscriptions
      null;
      
    let membership;
    
    if (existingMembership) {
      // Update existing membership
      console.log("Updating existing membership:", existingMembership.id);
      const { data: updatedMembership, error: updateError } = await supabaseClient
        .from('memberships')
        .update({
          status: 'active',
          is_subscription: isSubscription,
          renewal_at: renewalDate?.toISOString() || existingMembership.renewal_at,
          subscription_id: subscriptionId || existingMembership.subscription_id,
          last_payment_id: paymentId
        })
        .eq('id', existingMembership.id)
        .select()
        .single();
        
      if (updateError) {
        console.error("Error updating membership:", updateError);
        throw new Error(`Error updating membership: ${updateError.message}`);
      }
      
      membership = updatedMembership;
      console.log("Membership updated:", membership.id);
    } else {
      // Create new membership
      console.log("Creating new membership");
      const { data: newMembership, error: createError } = await supabaseClient
        .from('memberships')
        .insert({
          user_id: userId,
          status: 'active',
          is_subscription: isSubscription,
          started_at: new Date().toISOString(),
          renewal_at: renewalDate?.toISOString() || null,
          subscription_id: subscriptionId,
          last_payment_id: paymentId,
        })
        .select()
        .single();
        
      if (createError) {
        console.error("Error creating membership:", createError);
        throw new Error(`Error creating membership: ${createError.message}`);
      }
      
      membership = newMembership;
      console.log("Membership created:", membership.id);
    }
    
    // Create a membership payment record
    const { data: paymentRecord, error: paymentError } = await supabaseClient
      .from('membership_payments')
      .insert({
        membership_id: membership.id,
        amount: amountPaid / 100, // Convert cents to dollars
        payment_id: paymentId,
        payment_status: 'succeeded',
      })
      .select()
      .single();
      
    if (paymentError) {
      console.error("Error recording payment:", paymentError);
      throw new Error(`Error recording payment: ${paymentError.message}`);
    }
    
    console.log("Payment recorded:", paymentRecord.id);

    // If we created a new user, send a password reset email
    if (password) {
      const { error: resetError } = await supabaseClient.auth.admin.generateLink({
        type: 'recovery',
        email,
      });

      if (resetError) {
        console.error("Error sending password reset email:", resetError.message);
        // Don't fail the process for this error
      } else {
        console.log("Password reset email sent successfully");
      }
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
      console.log("Welcome email sent successfully");
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError.message);
      // Don't fail the process for this error
    }

    // Send invoice email
    try {
      console.log(`Attempting to send invoice email for session ${sessionId} to ${email}`);
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      if (!supabaseUrl) {
        throw new Error("SUPABASE_URL environment variable is not set");
      }
      
      // Full URL construction for the edge function call
      const invoiceEmailUrl = `${supabaseUrl}/functions/v1/send-invoice-email`;
      console.log("Calling invoice email function at:", invoiceEmailUrl);
      
      const response = await fetch(invoiceEmailUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          email,
          name
        }),
      });
      
      console.log("Invoice email API response status:", response.status);
      
      const responseData = await response.json();
      console.log("Invoice email function response:", responseData);
      
      if (!response.ok) {
        throw new Error(`Invoice email API returned error: ${responseData.message || responseData.error || "Unknown error"}`);
      }
    } catch (invoiceError) {
      console.error("Error sending invoice email:", invoiceError);
      // Don't fail the whole process if the invoice email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Membership activated successfully",
        userId,
        membershipId: membership.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    
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

// Email sending function
async function sendWelcomeEmail(email: string, name: string) {
  // In a production environment, this would use a service like Resend, SendGrid, etc.
  // For this demo, we'll use the custom email function we've created
  console.log(`Sending welcome email to ${email} with name ${name}`);
  
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL environment variable is not set");
  }
  
  // Email content
  const emailContent = `
    <h1>Welcome to Eat Meet Club!</h1>
    <p>Hi ${name},</p>
    <p>Your membership is now active.</p>
    <p>Your monthly subscription of $25 has been processed successfully. You can find your receipt in your email.</p>
    <p>To get started, please log in to your account at our website using the email address you registered with.</p>
    <p>We're excited to have you as a member!</p>
    <p>Best regards,<br>The Eat Meet Club Team</p>
  `;
  
  // Call the custom email function
  const response = await fetch(`${supabaseUrl}/functions/v1/send-custom-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: [email],
      subject: "Welcome to Eat Meet Club - Membership Activated",
      html: emailContent,
      emailType: "welcome",
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to send welcome email: ${error.message}`);
  }
  
  return true;
}
