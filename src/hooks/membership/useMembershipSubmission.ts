
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCheckoutSession } from "./useCheckoutSession";
import { useMembershipVerification } from "./useMembershipVerification";

export const useMembershipSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createCheckoutSession } = useCheckoutSession();
  const { verifyEmailAndMembershipStatus, handleExistingMember } = useMembershipVerification();

  const handleMembershipSubmit = async (formData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }) => {
    try {
      setIsLoading(true);
      
      // Store form data in localStorage for access during payment flow
      localStorage.setItem('signup_name', formData.name);
      localStorage.setItem('signup_email', formData.email);
      localStorage.setItem('signup_phone', formData.phone);
      localStorage.setItem('signup_address', formData.address);

      // Step 1: Check if user exists and has active membership
      const { userExists, hasActiveMembership } = await verifyEmailAndMembershipStatus(formData.email);

      // If user exists and has active membership, redirect to login
      if (userExists && hasActiveMembership) {
        handleExistingMember(formData.email);
        return;
      }

      // Step 2: Create checkout session
      const result = await createCheckoutSession(
        formData.email,
        formData.name,
        formData.phone,
        formData.address,
        {
          createUser: !userExists,
          sendPasswordEmail: !userExists,
        }
      );

      if (result.success && result.url) {
        setIsSubmitted(true);
        window.location.href = result.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Membership submission error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem processing your membership request.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSubmitted,
    handleMembershipSubmit,
    setIsSubmitted
  };
};

export default useMembershipSubmission;
