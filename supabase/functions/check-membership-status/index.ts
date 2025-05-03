
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { stripe } from "../_shared/stripe.ts";

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
    const requestBody = await req.json();
    const { email, name, redirectToCheckout = true } = requestBody;
    console.log("Request received:", { email, name, redirectToCheckout });
    
    if (!email) throw new Error("Missing email");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Step 1: Check if user exists
    console.log("Looking for user with email:", email);
    const { data: userList } = await supabase.auth.admin.listUsers();
    const user = userList.users.find((u) => u.email === email);
    let userId = user?.id;

    // Step 2: Create user if not exists
    if (!userId) {
      console.log("User not found, creating new user");
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        password: tempPassword,
        user_metadata: { 
          full_name: name || email.split('@')[0],
          phone: requestBody.phone || null,
          address: requestBody.address || null
        }
      });
      
      if (error) {
        console.error("Error creating user:", error);
        throw new Error("Error creating user: " + error.message);
      }
      
      userId = newUser.user?.id;
      console.log("New user created with ID:", userId);

      // Send password setup link
      if (requestBody.sendPasswordEmail !== false) {
        try {
          console.log("Sending password setup email");
          await supabase.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: "https://www.eatmeetclub.com/set-password" }
          });
          console.log("Password email sent successfully");
        } catch (emailError) {
          console.error("Error sending password email:", emailError);
          // Don't fail the whole process if just the email fails
        }
      }
    } else {
      console.log("User found:", userId);
    }

    // Step 3: Check membership status
    console.log("Checking for existing membership");
    const now = new Date().toISOString();
    const { data: membership } = await supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`renewal_at.gt.${now},renewal_at.is.null`)
      .maybeSingle();

    if (membership) {
      console.log("Active membership found:", membership.id);
      return new Response(JSON.stringify({
        success: true,
        activeMembership: true,
        message: "User already has active membership"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Step 4: Get price from admin config (e.g., monthly $25)
    // Todo: Replace with DB fetch if needed
    const priceCents = 2500; 
    
    if (!redirectToCheckout) {
      console.log("Not creating checkout session as redirectToCheckout is false");
      return new Response(JSON.stringify({
        success: true,
        activeMembership: false,
        message: "No active membership, but no checkout requested"
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Step 5: Create Stripe Checkout
    console.log("Creating Stripe customer and checkout session");
    const customer = await stripe.customers.create({ 
      email, 
      name: name || email.split('@')[0],
      metadata: {
        userId: userId,
        createUser: requestBody.createUser === true,
        sendPasswordEmail: requestBody.sendPasswordEmail === true,
        sendInvoiceEmail: requestBody.sendInvoiceEmail === true,
        timestamp: Date.now()
      }
    });
    
    console.log("Customer created:", customer.id);
    
    const frontendUrl = requestBody.frontendUrl || "https://www.eatmeetclub.com";
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Monthly Membership' },
            unit_amount: priceCents,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/membership-payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/membership-payment?canceled=true`,
      metadata: {
        userId: userId,
        createUser: requestBody.createUser === true,
        sendPasswordEmail: requestBody.sendPasswordEmail === true,
        sendInvoiceEmail: requestBody.sendInvoiceEmail === true,
        timestamp: Date.now()
      }
    });
    
    console.log("Checkout session created:", session.id);

    return new Response(JSON.stringify({
      success: true,
      activeMembership: false,
      checkoutUrl: session.url,
      userId: userId,
      customerId: customer.id,
      sessionId: session.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in check-membership-status:", err);
    return new Response(JSON.stringify({ 
      success: false, 
      message: err.message,
      stack: err.stack
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
