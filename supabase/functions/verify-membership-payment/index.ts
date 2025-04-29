
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
    // In a real implementation, for a subscription we'd check the subscription status
    // rather than paymentIntent status
    let paymentVerified = false;
    let sessionId = paymentId;
    
    try {
      if (isSubscription) {
        const session = await stripe.checkout.sessions.retrieve(paymentId);
        const subscriptionId = session.subscription as string;
        
        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          paymentVerified = subscription.status === 'active';
          console.log("Subscription verified:", { subscriptionId, status: subscription.status });
        } else {
          throw new Error("No subscription ID found in session");
        }
      } else {
        // For one-time payment
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        paymentVerified = paymentIntent.status === "succeeded";
        console.log("One-time payment verified:", { status: paymentIntent.status });
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
        is_member: true,
        membership_started: new Date().toISOString(),
        is_subscription: isSubscription,
        subscription_renewal: isSubscription ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : 
          null
      }
    });

    if (userError) {
      throw new Error(`Error creating user: ${userError.message}`);
    }

    console.log("User created successfully:", userData.user.id);

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

// Invoice email sending function with improved error handling
async function sendInvoiceEmail(sessionId: string, email: string, name: string) {
  try {
    console.log(`Sending invoice email request for session ${sessionId} to ${email}`);
    
    // Get the URL of the Supabase project
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL environment variable is not set");
    }
    
    // Call the send-invoice-email function directly
    const response = await fetch(`${supabaseUrl}/functions/v1/send-invoice-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add Authorization header if needed
      },
      body: JSON.stringify({
        sessionId,
        email,
        name
      }),
    });

    console.log(`Invoice email request response status: ${response.status}`);
    
    const responseData = await response.json();
    console.log("Invoice email response data:", responseData);
    
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to send invoice email");
    }

    return responseData;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    // Re-throw to be handled by the caller
    throw error;
  }
}

