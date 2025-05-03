// src/pages/payment-success.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      if (!sessionId) {
        setStatus("error");
        return;
      }

      try {
        // You can enhance this by adding a webhook instead
        const res = await fetch(`/api/verify-stripe-session?session_id=${sessionId}`);
        const data = await res.json();

        if (data?.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Failed to verify payment:", err);
        setStatus("error");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto mt-20 p-4 text-center">
      {status === "loading" && <p>Verifying your payment...</p>}
      {status === "success" && (
        <>
          <h1 className="text-2xl font-bold mb-4">Welcome to Eat Meet Club! 🎉</h1>
          <p className="mb-6">Your membership has been activated successfully.</p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="text-xl font-semibold mb-4">Oops!</h1>
          <p className="mb-6">We couldn’t verify your payment. Please check your email or contact support.</p>
          <Button onClick={() => navigate("/become-member")}>Try Again</Button>
        </>
      )}
    </div>
  );
};

export default PaymentSuccess;
