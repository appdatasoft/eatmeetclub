
import { stripe } from "../_shared/stripe.ts";

/**
 * Functions for handling Stripe operations
 */
export const stripeOperations = {
  /**
   * Create a Stripe checkout session
   */
  createCheckoutSession: async (
    customerId: string, 
    email: string,
    unitAmount: number = 2500,
    metadata: Record<string, string>,
    options: {
      origin: string,
      redirectToCheckout?: boolean
    }
  ) => {
    if (options.redirectToCheckout) {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Monthly Membership',
                description: 'Access to exclusive dining experiences',
              },
              unit_amount: unitAmount,
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${options.origin}/membership-payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${options.origin}/membership-payment?canceled=true`,
        metadata,
        billing_address_collection: 'required',
        phone_number_collection: { enabled: true },
      });

      return {
        success: true,
        url: session.url,
        sessionId: session.id,
        isProrated: unitAmount !== 2500,
        unitAmount: unitAmount / 100
      };
    } else {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: unitAmount,
        currency: 'usd',
        payment_method_types: ['card'],
        metadata,
        receipt_email: email,
        setup_future_usage: 'off_session',
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        isProrated: unitAmount !== 2500,
        unitAmount: unitAmount / 100
      };
    }
  },
  
  /**
   * Find or create a Stripe customer
   */
  findOrCreateCustomer: async (email: string, userId: string = '', name: string = '') => {
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId = customers.data.length ? customers.data[0].id : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        name: name || '',
        metadata: {
          user_id: userId
        }
      });
      customerId = customer.id;
    }
    
    return customerId;
  }
};
