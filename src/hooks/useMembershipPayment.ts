
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MembershipFormValues } from "@/components/membership/MembershipPaymentForm";

// Import refactored hooks
import { useUrlParams } from "@/hooks/membership/useUrlParams";
import { useMembershipConfig } from "@/hooks/membership/useMembershipConfig";
import { useFormSubmission } from "@/hooks/membership/useFormSubmission";
import { usePaymentVerification } from "@/hooks/membership/usePaymentVerification";

export const useMembershipPayment = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    cardNumber?: boolean;
    cardExpiry?: boolean;
    cardCvc?: boolean;
  }>({});
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [existingMembership, setExistingMembership] = useState(null);
  const [proratedAmount, setProratedAmount] = useState<number | null>(null);
  
  // Use the refactored hooks
  const { membershipFee, isLoading } = useMembershipConfig();
  const { paymentCanceled, paymentSuccess, sessionId } = useUrlParams();
  
  const { verifyPayment } = usePaymentVerification({});
  
  const { handleSubmit } = useFormSubmission({
    setIsProcessing,
    setNetworkError,
    setClientSecret,
    setPaymentIntentId,
    setProratedAmount,
    setExistingMembership
  });

  // Check for stored email when component loads
  useEffect(() => {
    const storedEmail = localStorage.getItem('signup_email');
    if (!storedEmail && (paymentSuccess || sessionId)) {
      console.log("No stored email found but payment verification needed");
      setNetworkError("Missing email for payment verification. Please try signing up again.");
    }
  }, [paymentSuccess, sessionId]);

  // Effect to verify payment on load when success=true
  useEffect(() => {
    const id = sessionId || paymentIntentId;
    if (paymentSuccess && id) {
      const storedEmail = localStorage.getItem('signup_email');
      if (storedEmail) {
        verifyPayment(id);
      } else {
        console.error("Cannot verify payment: missing email in localStorage");
        setNetworkError("Missing email for payment verification. Please try signing up again.");
      }
    }
  }, [paymentSuccess, sessionId, paymentIntentId, verifyPayment]);

  // Handler for when payment is successful on the page
  const handlePaymentSuccess = () => {
    if (paymentIntentId) {
      const storedEmail = localStorage.getItem('signup_email');
      if (storedEmail) {
        verifyPayment(paymentIntentId);
      } else {
        console.error("Cannot verify payment: missing email in localStorage");
        setNetworkError("Missing email for payment verification. Please try signing up again.");
      }
    }
  };

  // Handler to cancel and navigate away
  const handleCancel = () => {
    navigate("/");
  };

  return {
    membershipFee,
    isLoading,
    isProcessing,
    paymentCanceled,
    paymentSuccess,
    sessionId,
    formErrors,
    networkError,
    clientSecret,
    existingMembership,
    proratedAmount,
    handleSubmit,
    handleCancel,
    handlePaymentSuccess
  };
};

export default useMembershipPayment;
