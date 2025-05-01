
import { useState, useEffect } from "react";
import { NavigateFunction } from "react-router-dom";
import { SignupFormValues } from "../SignupForm";
import { usePaymentVerification } from "./usePaymentVerification";
import { useSignupForm } from "./useSignupForm";
import { usePaymentProcess } from "./usePaymentProcess";

interface UseSignupActionsProps {
  setIsLoading: (loading: boolean) => void;
  setUserDetails: (details: SignupFormValues | null) => void;
  setShowPaymentForm: (show: boolean) => void;
  setIsNotificationSent: (sent: boolean) => void;
  toast: any;
  navigate: NavigateFunction;
}

export const useSignupActions = ({
  setIsLoading,
  setUserDetails,
  setShowPaymentForm,
  setIsNotificationSent,
  navigate
}: UseSignupActionsProps) => {
  
  // Import the separated functionality
  const { 
    isPaymentVerified, 
    isVerifyingPayment, 
    checkPaymentStatus 
  } = usePaymentVerification({ 
    setIsLoading, 
    navigate 
  });
  
  const { 
    handleSignupSubmit 
  } = useSignupForm({ 
    setIsLoading, 
    setUserDetails, 
    setShowPaymentForm, 
    setIsNotificationSent 
  });
  
  const { 
    handlePayment 
  } = usePaymentProcess({ 
    setIsLoading 
  });

  // Check if we need to verify a successful payment based on URL params
  useEffect(() => {
    checkPaymentStatus();
  }, []);

  return {
    isPaymentVerified,
    isVerifyingPayment,
    handleSignupSubmit,
    handlePayment
  };
};
