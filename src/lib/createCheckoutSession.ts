import { supabase } from "@/integrations/supabase/client";

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
  // Ensure we have a valid Supabase client
  if (!supabase) {
    console.error("Supabase client not initialized");
    return { error: "Supabase client not initialized" };
  }

  try {
    // 1. Get Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Error getting Supabase session:", sessionError);
      return { error: sessionError.message };
    }

    if (!session?.access_token) {
      console.log("User is not signed in, creating checkout without authentication");
      
      // For users who are not signed in, call the function without auth token
      return await createCheckoutWithoutAuth({ email, name, phone, address, stripeMode });
    }

    try {
      // 2. Call Supabase Edge Function with auth and payload
      const res = await fetch("/functions/create-membership-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
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
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        return { error: "Server returned invalid JSON response. Please try again later." };
      }

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
  } catch (err: any) {
    console.error("Unexpected error in createCheckoutSession:", err);
    return { error: err.message || "An unexpected error occurred" };
  }
}

// Function to handle checkout for users who aren't authenticated
async function createCheckoutWithoutAuth(params: CheckoutPayload): Promise<{ url?: string; error?: string }> {
  try {
    console.log("Creating checkout without authentication for:", params.email);
    
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );

    const rawText = await res.text();
    console.log("Raw response from create-membership-checkout (unauthenticated):", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Failed to parse unauthenticated checkout response as JSON:", parseError);
      return { error: "Server returned invalid JSON response. Please try again later." };
    }

    if (!res.ok) {
      return { error: data.error || data.message || "Server error" };
    }

    return {
      url: data.url,
    };
  } catch (err: any) {
    console.error("Error in createCheckoutWithoutAuth:", err);
    return { error: err.message || "An unexpected error occurred" };
  }
}
