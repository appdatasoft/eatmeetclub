
import { supabase } from "@/lib/supabaseClient";

export async function insertMembership({
  email,
  name,
  phone,
  address,
  stripeSessionId,
  userId,
}: {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  stripeSessionId?: string;
  userId: string; // The user_id is required by the memberships table
}) {
  const { error } = await supabase
    .from("memberships")
    .insert({
      user_id: userId,
      status: 'active',
      is_subscription: true,
      started_at: new Date().toISOString(),
      last_payment_id: stripeSessionId
    });

  if (error) {
    console.error("Failed to insert membership:", error);
    return false;
  }

  return true;
}
