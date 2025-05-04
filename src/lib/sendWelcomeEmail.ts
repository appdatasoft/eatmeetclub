import { supabase } from "@/lib/supabaseClient";

export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    console.error("No Supabase session found.");
    return false;
  }

  const res = await fetch("/functions/send-welcome-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ email, name }),
  });

  return res.ok;
}
