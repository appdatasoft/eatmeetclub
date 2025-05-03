// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const stripe = new Stripe(Deno.env.get("STRIPE_WEBHOOK_SECRET")!, {
  apiVersion: "2022-11-15",
  typescript: true
});

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
    event = stripe.webhooks.constructEvent(bodyText, sig, Deno.env.get("STRIPE_ENDPOINT_SECRET")!);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email;

    const fallbackInvoiceUrl = `https://invoices.eatmeetclub.com/${encodeURIComponent(email || "unknown")}`;
    const receipt_url = session?.invoice && (session.invoice as any).hosted_invoice_url
      ? (session.invoice as any).hosted_invoice_url
      : fallbackInvoiceUrl;

    if (email) {
      const { error } = await supabase
        .from("memberships")
        .upsert({
          user_email: email,
          status: "active",
          activated_at: new Date().toISOString(),
          expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
        }, { onConflict: "user_email" });

      if (error) {
        console.error("Failed to update membership:", error);
        return new Response("Failed to update membership", { status: 500 });
      }

      // Generate PDF invoice
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 400]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const size = 12;

      page.drawText("Invoice - Eat Meet Club", { x: 50, y: 370, size, font, color: rgb(0, 0, 0) });
      page.drawText(`Email: ${email}`, { x: 50, y: 340, size, font });
      page.drawText("Membership Fee: $25.00", { x: 50, y: 310, size, font });
      page.drawText(`Valid Until: ${new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}`, { x: 50, y: 280, size, font });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
      const pdfBuffer = new Uint8Array(await pdfBlob.arrayBuffer());

      const pdfPath = `invoices/${email}.pdf`;
      await supabase.storage.from("invoices").upload(pdfPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true
      });

      const { data: publicUrlData } = supabase.storage.from("invoices").getPublicUrl(pdfPath);
      const pdfPublicUrl = publicUrlData?.publicUrl || receipt_url;

      // Send welcome/invoice email with direct PDF link
      await fetch(`${Deno.env.get("SITE_URL")}/functions/v1/send-welcome-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, receipt_url: pdfPublicUrl })
      });
    }
  }

  return new Response("Webhook received", { status: 200 });
});
