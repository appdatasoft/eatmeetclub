import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const stripe = new Stripe(Deno.env.get("STRIPE_WEBHOOK_SECRET")!, {
  apiVersion: "2022-11-15",
  typescript: true
});

async function sendWelcomeEmail(email: string, receipt_url: string) {
  const siteUrl = Deno.env.get("SITE_URL")!;
  try {
    await fetch(`${siteUrl}/functions/v1/send-welcome-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, receipt_url })
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err);
  }
}

async function handlePaymentSuccess(email: string, receipt_url: string, supabase: any) {
  const { data: existing } = await supabase
    .from("memberships")
    .select("expires_at")
    .eq("user_email", email)
    .maybeSingle();

  const baseDate = existing?.expires_at && new Date(existing.expires_at) > new Date()
    ? new Date(existing.expires_at)
    : new Date();

  const expiresAt = new Date(baseDate.setMonth(baseDate.getMonth() + 1));

  const { error } = await supabase
    .from("memberships")
    .upsert({
      user_email: email,
      status: "active",
      activated_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString()
    }, { onConflict: "user_email" });

  if (error) {
    console.error("Failed to update membership:", error);
    return;
  }

  const { error: billingError } = await supabase.from("billing_history").insert({
    email,
    amount: 25.0,
    paid_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    receipt_url
  });

  if (billingError) {
    console.error("Failed to log billing history:", billingError);
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const size = 12;

  page.drawText("Invoice - Eat Meet Club", { x: 50, y: 370, size, font, color: rgb(0, 0, 0) });
  page.drawText(`Email: ${email}`, { x: 50, y: 340, size, font });
  page.drawText("Membership Fee: $25.00", { x: 50, y: 310, size, font });
  page.drawText(`Valid Until: ${expiresAt.toLocaleDateString()}`, { x: 50, y: 280, size, font });

  const pdfBytes = await pdfDoc.save();
  const pdfPath = `invoices/${email}.pdf`;

  await supabase.storage.from("invoices").upload(pdfPath, new Uint8Array(pdfBytes), {
    contentType: "application/pdf",
    upsert: true
  });

  const { data: publicUrlData } = supabase.storage.from("invoices").getPublicUrl(pdfPath);
  const pdfPublicUrl = publicUrlData?.publicUrl || receipt_url;

  await sendWelcomeEmail(email, pdfPublicUrl);
}

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const bodyText = await req.text();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      bodyText,
      sig,
      Deno.env.get("STRIPE_ENDPOINT_SECRET")!
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const extractEmailAndUrl = (obj: any) => {
    const email = obj.customer_email || obj.customer_details?.email;
    const receipt_url = obj?.invoice && obj.invoice.hosted_invoice_url
      ? obj.invoice.hosted_invoice_url
      : `https://invoices.eatmeetclub.com/${encodeURIComponent(email || "unknown")}`;
    return { email, receipt_url };
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { email, receipt_url } = extractEmailAndUrl(session);
    if (email) await handlePaymentSuccess(email, receipt_url, supabase);
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const { email, receipt_url } = extractEmailAndUrl(invoice);
    if (email) await handlePaymentSuccess(email, receipt_url, supabase);
  }

  return new Response("Webhook received", { status: 200 });
});
