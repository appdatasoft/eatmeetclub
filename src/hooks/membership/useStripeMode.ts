
// src/hooks/membership/useStripeMode.ts
import { useEffect, useState } from "react";

export const useStripeMode = () => {
  const [mode, setMode] = useState<"test" | "live">("test");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMode = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-stripe-mode`);
        const data = await res.json();
        if (data?.mode === "live" || data?.mode === "test") {
          setMode(data.mode);
        }
      } catch (err) {
        console.error("Failed to fetch stripe mode", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMode();
  }, []);

  return { mode, isLive: mode === "live", loading };
};
