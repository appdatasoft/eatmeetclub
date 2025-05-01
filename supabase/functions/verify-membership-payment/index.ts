
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

    // Generate a random password for the new user
    const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

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
    
    // Create the user account in Supabase
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

    console.log("User created successfully:", userData.user.id);

    // Create a new membership record
    const renewalDate = isSubscription ? 
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // 30 days from now for subscriptions
      null;

    const { data: membership, error: membershipError } = await supabaseClient
      .from('memberships')
      .insert({
        user_id: userData.user.id,
        status: 'active',
        is_subscription: isSubscription,
        started_at: new Date().toISOString(),
        renewal_at: renewalDate?.toISOString() || null,
        subscription_id: subscriptionId,
        last_payment_id: paymentId,
      })
      .select()
      .single();
      
    if (membershipError) {
      console.error("Error creating membership:", membershipError);
      throw new Error(`Error creating membership: ${membershipError.message}`);
    }
    
    console.log("Membership created:", membership.id);
    
    // Create a membership payment record
    const { error: paymentError } = await supabaseClient
      .from('membership_payments')
      .insert({
        membership_id: membership.id,
        amount: amountPaid / 100, // Convert cents to dollars
        payment_id: paymentId,
        payment_status: 'succeeded',
      });
      
    if (paymentError) {
      console.error("Error recording payment:", paymentError);
      // Don't fail the whole process if payment record fails
    }

    // Send a password reset email so the user can set their own password
    const { error: resetError } = await supabaseClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    if (resetError) {
      console.error("Error sending password reset email:", resetError.message);
    } else {
      console.log("Password reset email sent successfully");
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
      console.log("Welcome email sent successfully");
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError.message);
    }

    // Send invoice email - add more detailed logging
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
        message: "Membership activated and account created successfully",
        userId: userData.user.id,
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
  // For this demo, we'll simply log that we would send an email
  console.log(`Would send welcome email to ${email} with name ${name}`);
  
  // Mock email content
  const emailContent = `
    Hi ${name},
    
    Welcome to Eat Meet Club! Your membership is now active.
    
    Your monthly subscription of $25 has been processed successfully. You can find your receipt in your Stripe account or email.
    
    To get started, please log in to your account at our website using the email address you registered with. You should have received a separate password reset email to set your password.
    
    We're excited to have you as a member!
    
    Best regards,
    The Eat Meet Club Team
  `;
  
  console.log("Email content:", emailContent);
  
  // In a real implementation, this would call an email service API
  return true;
}
