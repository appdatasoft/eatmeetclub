import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const MembershipConfirmed = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying your payment...");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      // Optional: Call your backend or webhook here
      setMessage("🎉 Payment successful! You're now a member of Eat Meet Club.");
    } else {
      setMessage("❌ Payment session not found.");
    }
  }, [sessionId]);

  return (
    <div className="p-6 max-w-xl mx-auto text-center">
      <h1 className="text-2xl font-bold mb-4">Membership Confirmation</h1>
      <p>{message}</p>
    </div>
  );
};

export default MembershipConfirmed;
