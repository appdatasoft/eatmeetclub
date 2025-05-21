
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCheckoutSession } from "./useCheckoutSession";
import { MembershipFormValues } from "@/lib/schemas/membership";
import { supabase } from "@/integrations/supabase/client";

export const useMembershipSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createCheckoutSession } = useCheckoutSession();

  // Check if email exists and has active membership
  const checkEmailAndMembershipStatus = async (email: string, restaurantId?: string) => {
    try {
      // Check if user exists
      const { data: userExistData, error: userExistError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();
      
      if (userExistError) throw userExistError;
      
      const userExists = !!userExistData;
      let hasActiveMembership = false;
      let productInfo = null;
      
      // If user exists, check for active membership
      if (userExists) {
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('*, products(*)')
          .eq('user_email', email.toLowerCase())
          .eq('status', 'active')
          .is('restaurant_id', restaurantId || null) // Filter by restaurant if provided
          .maybeSingle();
        
        if (membershipError) throw membershipError;
        
        hasActiveMembership = !!membershipData;
        if (membershipData) {
          productInfo = membershipData.products;
        }
      }
      
      return { userExists, hasActiveMembership, productInfo };
    } catch (error) {
      console.error("Error checking email and membership:", error);
      return { userExists: false, hasActiveMembership: false, productInfo: null };
    }
  };

  // Handle user who already has an active membership
  const handleExistingMember = (email: string, restaurantId?: string, productInfo?: any) => {
    toast({
      title: "Welcome back!",
      description: "You already have an active membership. Redirecting to login...",
    });
    
    // Redirect to login page with email pre-filled
    navigate('/login', { state: { 
      email, 
      message: "You already have an active membership. Please log in to continue." 
    } });
  };

  const handleMembershipSubmit = async (formData: MembershipFormValues) => {
    try {
      setIsLoading(true);

      // Store form data in localStorage for access during payment flow
      localStorage.setItem('signup_name', formData.name);
      localStorage.setItem('signup_email', formData.email);
      localStorage.setItem('signup_phone', formData.phone);
      localStorage.setItem('signup_address', formData.address);

      // Step 1: Check if user exists and has active membership
      const { userExists, hasActiveMembership, productInfo } = await checkEmailAndMembershipStatus(
        formData.email,
        formData.restaurantId
      );

      // If user exists and has active membership, redirect to login
      if (userExists && hasActiveMembership) {
        handleExistingMember(formData.email, formData.restaurantId, productInfo);
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
          sendInvoiceEmail: true,
          checkExisting: true,
          restaurantId: formData.restaurantId
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
