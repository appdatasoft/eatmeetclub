
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

/**
 * Functions for handling membership operations
 */
export const membershipOperations = {
  /**
   * Check for existing active membership
   */
  checkExistingMembership: async (userId: string, restaurantId?: string) => {
    console.log("Checking for existing membership for user:", userId, "restaurant:", restaurantId);
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const now = new Date().toISOString();
    
    // If a restaurant ID is provided, check for that specific restaurant
    const query = supabase
      .from("memberships")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(`renewal_at.gt.${now},renewal_at.is.null`);
      
    if (restaurantId) {
      query.eq("restaurant_id", restaurantId);
    }
    
    const { data: existingMembership } = await query.maybeSingle();
    
    return existingMembership;
  },
  
  /**
   * Create a new membership
   */
  createMembership: async (
    userId: string, 
    subscriptionId: string | null, 
    sessionId: string,
    restaurantId?: string,
    productId?: string
  ) => {
    console.log("Creating new membership record", { userId, restaurantId, productId });
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    // Insert membership
    const membershipData: any = {
      user_id: userId,
      status: "active",
      is_subscription: !!subscriptionId,
      started_at: new Date().toISOString(),
      renewal_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_id: subscriptionId,
      last_payment_id: sessionId,
    };
    
    // Add restaurant ID if provided
    if (restaurantId) {
      membershipData.restaurant_id = restaurantId;
    }
    
    // Add product ID if provided
    if (productId) {
      membershipData.product_id = productId;
    }
    
    const { data: membership, error: mErr } = await supabase
      .from("memberships")
      .insert(membershipData)
      .select()
      .single();

    if (mErr) {
      console.error("Failed to insert membership:", mErr);
      throw new Error("Failed to insert membership: " + mErr.message);
    }
    
    console.log("Membership created:", membership.id);
    return membership;
  },
  
  /**
   * Record a payment for a membership
   */
  recordPayment: async (membershipId: string, sessionId: string, amount: number = 25) => {
    console.log("Creating payment record");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    
    const { error: pErr } = await supabase
      .from("membership_payments")
      .insert({
        membership_id: membershipId,
        payment_id: sessionId,
        amount: amount,
        payment_status: "succeeded"
      });

    if (pErr) {
      console.error("Failed to insert payment:", pErr);
      throw new Error("Failed to insert payment: " + pErr.message);
    }
    
    console.log("Payment record created successfully");
    return true;
  }
};
