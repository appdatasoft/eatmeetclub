
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

// Initialize Stripe with the secret key from environment variable
export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16", // Use the latest Stripe API version
  httpClient: Stripe.createFetchHttpClient(),
});
