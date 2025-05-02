
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
  
  // Use the refactored hooks
  const { membershipFee, isLoading } = useMembershipConfig();
  const { paymentCanceled, paymentSuccess, sessionId } = useUrlParams();
  
  const { verifyPayment } = usePaymentVerification({
    setIsProcessing
  });
  
  const { handleSubmit } = useFormSubmission({
    setIsProcessing,
    setNetworkError,
    setClientSecret,
    setPaymentIntentId
  });

  // Effect to verify payment on load when success=true
  useEffect(() => {
    const id = sessionId || paymentIntentId;
    if (paymentSuccess && id) {
      verifyPayment(id);
    }
  }, [paymentSuccess, sessionId, paymentIntentId]);

  // Handler for when payment is successful on the page
  const handlePaymentSuccess = () => {
    if (paymentIntentId) {
      verifyPayment(paymentIntentId);
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
    handleSubmit,
    handleCancel,
    handlePaymentSuccess
  };
};

export default useMembershipPayment;
