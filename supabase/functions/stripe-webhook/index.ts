
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const sig = req.headers.get("stripe-signature")!;
    const body = await req.text();

    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email || session.metadata?.user_email;

      if (!email) {
        console.warn("No email found in checkout.session.completed event.");
      } else {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Use listUsers and find the user by email
        const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();

        if (fetchError) {
          console.error("Failed to fetch users:", fetchError);
        } else {
          const user = users.users.find(u => u.email === email);
          
          if (!user) {
            console.error("User not found with email:", email);
          } else {
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                membership_active: true,
                membership_activated_at: new Date().toISOString(),
                stripe_session_id: session.id,
              },
            });

            if (updateError) {
              console.error("Failed to update user metadata:", updateError);
            } else {
              console.log(`✅ Membership activated for: ${email}`);
              
              // Extract product information
              let productId = null;
              
              // If this is a subscription, get the product ID from the subscription
              if (session.subscription) {
                try {
                  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                  if (subscription.items.data.length > 0) {
                    const item = subscription.items.data[0];
                    productId = item.price.product as string;
                    console.log(`Found product ID from subscription: ${productId}`);
                  }
                } catch (subscriptionError) {
                  console.error("Failed to retrieve subscription details:", subscriptionError);
                }
              }
              
              // If product ID wasn't found from subscription, check line items
              if (!productId && session.line_items) {
                try {
                  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                  if (lineItems.data.length > 0) {
                    const item = lineItems.data[0];
                    if (item.price?.product) {
                      productId = item.price.product as string;
                      console.log(`Found product ID from line items: ${productId}`);
                    }
                  }
                } catch (lineItemsError) {
                  console.error("Failed to retrieve line items:", lineItemsError);
                }
              }
              
              // Also check session metadata for product_id
              if (!productId && session.metadata?.product_id) {
                productId = session.metadata.product_id;
                console.log(`Found product ID from session metadata: ${productId}`);
              }
              
              // Create a membership record with the product ID
              const { error: membershipError } = await supabase
                .from('memberships')
                .insert({
                  user_id: user.id,
                  status: 'active',
                  is_subscription: session.mode === 'subscription',
                  started_at: new Date().toISOString(),
                  renewal_at: session.mode === 'subscription' ? 
                    new Date(Date.now() + 30*24*60*60*1000).toISOString() : null,
                  last_payment_id: session.id,
                  subscription_id: session.subscription,
                  product_id: productId
                });
                
              if (membershipError) {
                console.error("Failed to create membership record:", membershipError);
              } else {
                console.log("✅ Membership record created successfully with product ID:", productId);
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook handler failed" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
