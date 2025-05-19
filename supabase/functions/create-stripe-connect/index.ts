
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function for more detailed logging
function log(step: string, details: any = {}) {
  console.log(`[STRIPE-CONNECT] [${new Date().toISOString()}] ${step}:`, JSON.stringify(details));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    log("Stripe Connect function called");
    
    // Get Stripe API key from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      log("Missing Stripe secret key");
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Missing Stripe key' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Create Supabase client with auth context from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      log("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with the provided auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get the user from the auth context
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      log("Authentication error", { error: userError?.message });
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    log("Authenticated user", { userId: user.id, email: user.email });

    // Parse request body
    const requestData = await req.json();
    log("Request payload received", requestData);
    
    const { accountType = 'standard' } = requestData;
    
    // Check if user already has a connected Stripe account
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('stripe_connect_id')
      .eq('user_id', user.id)
      .single();
      
    let stripeAccountId: string | undefined;
    
    if (profileError && profileError.code !== 'PGRST116') { // Not found error code
      log("Error fetching user profile", { error: profileError });
      return new Response(
        JSON.stringify({ error: 'Error fetching user profile' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (userProfile?.stripe_connect_id) {
      stripeAccountId = userProfile.stripe_connect_id;
      log("Existing Stripe Connect account found", { stripeAccountId });
    } else {
      // Create a new Stripe Connect account
      log("Creating new Stripe Connect account", { accountType });
      
      try {
        const account = await stripe.accounts.create({
          type: accountType,
          email: user.email,
          metadata: {
            user_id: user.id,
          },
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
        });
        
        stripeAccountId = account.id;
        log("Created Stripe Connect account", { stripeAccountId });
        
        // Store the Stripe account ID in the user_profiles table
        const { error: updateError } = await supabaseClient
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            stripe_connect_id: stripeAccountId,
            stripe_connect_status: 'pending',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          
        if (updateError) {
          log("Error updating user profile with Stripe ID", { error: updateError });
          // Continue anyway as we've already created the account
        }
      } catch (stripeError) {
        log("Error creating Stripe account", { error: stripeError.message });
        return new Response(
          JSON.stringify({ error: `Failed to create Stripe account: ${stripeError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Get origin URL for redirect
    let origin = req.headers.get('origin');
    if (!origin) {
      // Fallback to referrer if origin is not available
      const referrer = req.headers.get('referer');
      if (referrer) {
        try {
          const url = new URL(referrer);
          origin = `${url.protocol}//${url.host}`;
        } catch (e) {
          log("Failed to parse referrer", { error: e.message });
          origin = 'https://eatmeetclub.lovable.app';
        }
      } else {
        // Last resort fallback
        origin = 'https://eatmeetclub.lovable.app';
      }
    }
    
    // Create an account link for the Stripe Connect onboarding
    try {
      const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${origin}/dashboard/payments?refresh=true`,
        return_url: `${origin}/dashboard/payments?success=true`,
        type: 'account_onboarding',
      });
      
      log("Created account link", { url: accountLink.url });
      
      return new Response(
        JSON.stringify({ 
          url: accountLink.url,
          account_id: stripeAccountId
        }),
        { 
          status: 200, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (linkError) {
      log("Error creating account link", { error: linkError.message });
      return new Response(
        JSON.stringify({ error: `Failed to create account link: ${linkError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    log('Error in create-stripe-connect function', { 
      message: error.message,
      stack: error.stack
    });
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
