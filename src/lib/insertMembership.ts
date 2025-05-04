import { supabase } from "@/lib/supabaseClient";

export async function insertMembership({
  email,
  name,
  phone,
  address,
  stripeSessionId,
}: {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  stripeSessionId?: string;
}) {
  const { error } = await supabase
    .from("memberships")
    .insert([{ email, name, phone, address, stripe_session_id: stripeSessionId }]);

  if (error) {
    console.error("Failed to insert membership:", error);
    return false;
  }

  return true;
}
