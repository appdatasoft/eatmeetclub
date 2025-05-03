
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

/**
 * Functions for handling membership operations
 */
export const membershipUtils = {
  /**
   * Check for an existing membership and calculate prorated amount if needed
   */
  checkExistingMembership: async (userId: string | null) => {
    if (!userId) return null;
    
    try {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      const now = new Date();
      const { data } = await supabaseClient
        .from('memberships')
        .select(`id, status, is_subscription, started_at, renewal_at, subscription_id, user_id`)
        .eq('user_id', userId)
        .eq('status', 'active')
        .or(`renewal_at.gt.${now.toISOString()},renewal_at.is.null`)
        .maybeSingle();

      return data || null;
    } catch (error) {
      console.error("Error checking membership:", error);
      return null;
    }
  },
  
  /**
   * Calculate prorated unit amount based on existing membership
   */
  calculateProratedAmount: (existingMembership: any, proratedAmount: number | null) => {
    if (!existingMembership || !existingMembership.renewal_at) {
      return 2500; // Default to full price
    }
    
    // If a specific prorated amount was provided, use it
    if (proratedAmount !== null) {
      return Math.round(proratedAmount * 100);
    }
    
    // Calculate the prorated amount based on remaining days
    const now = new Date();
    const elapsedMs = now.getTime() - new Date(existingMembership.started_at).getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));
    const remainingDays = 30 - elapsedDays;
    
    if (remainingDays <= 0) return 2500;
    else if (remainingDays < 15) return 1250;
    throw new Error("Active membership exists with >15 days remaining");
  }
};
