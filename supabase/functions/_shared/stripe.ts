
import Stripe from "https://esm.sh/stripe@12.1.0?target=deno";

export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2022-11-15",
});
