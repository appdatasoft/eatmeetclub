import { supabase } from "@/lib/supabaseClient";

interface CheckoutPayload {
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  stripeMode?: "test" | "live";
}

export async function createCheckoutSession({
  email,
  name,
  phone,
  address,
  stripeMode = "test",
}: CheckoutPayload): Promise<{ url?: string; error?: string }> {
  // 1. Get Supabase session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("User is not signed in.");
  }

  try {
    // 2. Call Supabase Edge Function with auth and payload
    const res = await fetch("/functions/create-membership-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        email,
        name,
        phone,
        address,
        stripeMode,
      }),
    });

    // 3. Debug: log raw response before trying to parse
    const rawText = await res.text();
    console.log("🚨 Raw response from create-membership-checkout:", rawText);

    // 4. Attempt to parse JSON
    const data = JSON.parse(rawText);

    if (!res.ok) {
      return { error: data.error || "Server error" };
    }

    return {
      url: data.url,
    };
  } catch (err: any) {
    console.error("💥 JSON parsing or network error:", err);
    return { error: "Server did not return valid JSON. It may have failed internally." };
  }
}
