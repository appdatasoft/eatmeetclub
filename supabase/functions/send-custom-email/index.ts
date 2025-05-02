
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@1.0.0";

// Initialize Resend with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY");
if (!resendApiKey) {
  console.error("RESEND_API_KEY is not set!");
}

export const resend = new Resend(resendApiKey);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  emailType?: string;
  fromName?: string;
  fromEmail?: string;
  preventDuplicate?: boolean;
}

// Track sent emails to prevent duplicates during function execution
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
    console.log("Custom email function called");
    
    const { to, subject, html, text, replyTo, emailType, fromName, fromEmail, preventDuplicate } = await req.json() as EmailRequest;
    
    if (!to || !to.length || !subject || !html) {
      throw new Error("Missing required email parameters");
    }
    
    console.log(`Sending ${emailType || "custom"} email to:`, to);
    console.log("Email subject:", subject);
    console.log("Email content preview:", html.substring(0, 100) + "...");
    console.log("Email using Resend API key:", resendApiKey ? "API key is set" : "API key is NOT set");

    // Verify we have valid recipients
    if (!to.every(email => email && email.includes('@'))) {
      throw new Error(`Invalid email recipient(s): ${to.join(', ')}`);
    }

    // Check if this exact email was sent recently (within last 60 seconds)
    if (preventDuplicate) {
      const cacheKey = `${to.join(',')}:${subject}`;
      if (sentEmails.has(cacheKey)) {
        const lastSent = sentEmails.get(cacheKey);
        const timeSince = new Date().getTime() - lastSent!.getTime();
        
        if (timeSince < 60000) {
          console.log(`Preventing duplicate email to ${to} with subject "${subject}" (sent ${timeSince}ms ago)`);
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
      
      // Mark this email as sent
      sentEmails.set(cacheKey, new Date());
    }

    // Define the from address with optional customization
    const from = `${fromName || "Eat Meet Club"} <${fromEmail || "info@eatmeetclub.com"}>`;
    
    // Try to send the email with detailed error handling
    try {
      const emailResponse = await resend.emails.send({
        from,
        to,
        subject,
        html,
        text: text || undefined,
        reply_to: replyTo || "info@eatmeetclub.com",
      });

      console.log("Email sent successfully:", emailResponse);

      return new Response(
        JSON.stringify({
          success: true,
          data: emailResponse,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (emailError) {
      console.error("Error sending email via Resend:", emailError);
      
      // Try fallback if first attempt failed
      try {
        console.log("Attempting fallback email sending...");
        
        // Try with different from address
        const fallbackResponse = await resend.emails.send({
          from: "Eat Meet Club <onboarding@resend.dev>", // Fallback sender
          to,
          subject,
          html,
          text: text || undefined,
        });
        
        console.log("Fallback email sent successfully:", fallbackResponse);
        
        return new Response(
          JSON.stringify({
            success: true,
            data: fallbackResponse,
            fallback: true,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (fallbackError) {
        console.error("Fallback email also failed:", fallbackError);
        
        // Try one more time with minimal settings
        try {
          console.log("Attempting last resort email sending...");
          
          const lastResortResponse = await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            html: `<p>${html.replace(/<[^>]*>?/gm, '')}</p>`,
          });
          
          console.log("Last resort email sent successfully:", lastResortResponse);
          
          return new Response(
            JSON.stringify({
              success: true,
              data: lastResortResponse,
              lastResort: true,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            }
          );
        } catch (lastResortError) {
          console.error("All email sending attempts failed:", lastResortError);
          throw new Error(`Email sending failed after multiple attempts: ${lastResortError.message}`);
        }
      }
    }
  } catch (error) {
    console.error("Error sending custom email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
