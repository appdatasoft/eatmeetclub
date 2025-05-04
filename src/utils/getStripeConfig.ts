
import { supabase } from "@/integrations/supabase/client";

/**
 * Get the Stripe mode setting from admin_config
 */
export const getStripeMode = async (): Promise<"test" | "live"> => {
  try {
    const { data } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'stripe_mode')
      .single();
    
    return data?.value === 'live' ? 'live' : 'test';
  } catch (error) {
    console.error('Error fetching Stripe mode:', error);
    return 'test'; // Default to test mode for safety
  }
};

/**
 * Get the Stripe price ID for memberships
 */
export const getStripePriceId = async (): Promise<string | null> => {
  try {
    const { data } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'stripe_price_id')
      .single();
    
    return data?.value || null;
  } catch (error) {
    console.error('Error fetching Stripe price ID:', error);
    return null;
  }
};

/**
 * Get the membership fee amount in cents
 */
export const getMembershipFeeInCents = async (): Promise<number> => {
  try {
    const { data } = await supabase
      .from('admin_config')
      .select('value')
      .eq('key', 'membership_fee')
      .single();
    
    return data?.value ? parseInt(data.value, 10) : 2500; // Default to $25.00
  } catch (error) {
    console.error('Error fetching membership fee:', error);
    return 2500; // Default to $25.00 if there's an error
  }
};
