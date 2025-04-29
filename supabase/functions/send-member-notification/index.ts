
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    // Parse the request body
    const { email, name, phone } = await req.json();
    if (!email) throw new Error("No email provided");

    console.log("Sending notification to:", { email, name, phone });

    // Send email (in a production app, you would use a service like Resend, SendGrid, etc.)
    await sendEmail(email, name);

    // Send SMS if phone number is provided (in a production app, you would use a service like Twilio)
    if (phone) {
      await sendSMS(phone, name);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification sent successfully",
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

// Mock email sending function (would use a real service in production)
async function sendEmail(email: string, name: string) {
  console.log(`MOCK: Sending email to ${email} for ${name}`);
  
  const emailContent = `
    Hi ${name},
    
    Thank you for your interest in Eat Meet Club membership!
    
    We've received your information and are excited to welcome you to our community.
    You'll be redirected to our payment page to complete your subscription.
    
    Best regards,
    The Eat Meet Club Team
  `;
  
  console.log("Email content:", emailContent);
  
  // In a real implementation, this would call an email service API
  // For now we just log it
  return true;
}

// Mock SMS sending function (would use a real service in production)
async function sendSMS(phone: string, name: string) {
  console.log(`MOCK: Sending SMS to ${phone} for ${name}`);
  
  const smsContent = `Hi ${name}, thank you for your interest in Eat Meet Club membership! We've received your information and are excited to welcome you.`;
  
  console.log("SMS content:", smsContent);
  
  // In a real implementation, this would call an SMS service API
  // For now we just log it
  return true;
}
