import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@1.2.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { email, receipt_url } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const invoiceHTML = generateInvoiceHTML(email, receipt_url);

    const { error } = await resend.emails.send({
      from: "Eat Meet Club <noreply@eatmeetclub.com>",
      to: email,
      subject: "Welcome to Eat Meet Club!",
      html: invoiceHTML
    });

    if (error) {
      console.error("Resend email error:", error);
      return new Response(JSON.stringify({ error: "Email failed to send." }), { status: 500 });
    }

    // Log email delivery
    const { error: logError } = await supabase.from("email_logs").insert({
      email,
      type: "welcome",
      sent_at: new Date().toISOString(),
      receipt_url: receipt_url || null
    });

    if (logError) {
      console.error("Failed to log email event:", logError);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("send-welcome-email error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
});

function getOneMonthFromNow(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function generateInvoiceHTML(email: string, receipt_url?: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px;">
      <h1 style="color: #1D4ED8;">🎉 Welcome to Eat Meet Club!</h1>
      <p>Your membership is now active. We’re excited to have you join our food-loving community!</p>

      <p><strong>What's next?</strong></p>
      <ul>
        <li>✅ Explore curated dining events</li>
        <li>✅ Get exclusive member perks</li>
        <li>✅ Connect with other foodies</li>
      </ul>

      <p>Your membership is valid until <strong>${getOneMonthFromNow()}</strong>.</p>

      <a href="https://www.eatmeetclub.com/login" style="display: inline-block; padding: 10px 20px; background-color: #1D4ED8; color: white; text-decoration: none; border-radius: 4px;">Log in now</a>

      <h2 style="margin-top: 40px;">📄 Your Receipt</h2>
      <p style="margin-top: 10px; font-size: 0.9em; color: #555;">
        ${receipt_url
          ? `Download your official receipt <a href="${receipt_url}" target="_blank">here</a>.`
          : `Need a PDF version? <a href="https://invoices.eatmeetclub.com/${encodeURIComponent(email)}" target="_blank">Download your invoice here</a>.`}
      </p>
    </div>
  `;
}

