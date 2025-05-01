
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
}

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
    
    const { to, subject, html, text, replyTo, emailType } = await req.json() as EmailRequest;
    
    if (!to || !to.length || !subject || !html) {
      throw new Error("Missing required email parameters");
    }
    
    console.log(`Sending ${emailType || "custom"} email to:`, to);

    const emailResponse = await resend.emails.send({
      from: "Eat Meet Club <info@eatmeetclub.com>",
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
