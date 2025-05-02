
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useMembershipSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMembershipSubmit = async (values: any) => {
    // Prevent multiple submissions
    if (isLoading || isSubmitted) {
      toast({
        title: "Processing",
        description: "Your membership request is already being processed",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { name, email, phone, address } = values;
      
      // Validate required fields
      if (!email) {
        throw new Error("Email is required");
      }
      
      if (!name) {
        throw new Error("Name is required");
      }
      
      console.log("Storing user details in localStorage:", { email, name, phone, address });
      
      // Store all details for verification later - do this BEFORE any API calls
      localStorage.setItem('signup_email', email);
      localStorage.setItem('signup_name', name);
      if (phone) localStorage.setItem('signup_phone', phone);
      if (address) localStorage.setItem('signup_address', address);
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem('signup_email', email);
      sessionStorage.setItem('signup_name', name);
      if (phone) sessionStorage.setItem('signup_phone', phone);
      if (address) sessionStorage.setItem('signup_address', address);
      
      // Double check that email is stored to avoid verification issues
      if (!localStorage.getItem('signup_email')) {
        console.error("Failed to store email in localStorage");
        localStorage.setItem('signup_email', email);
      }
      
      // Create a checkout session directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            name,
            phone,
            address,
            redirectToCheckout: true,
            // Add metadata to help with user creation and emails
            createUser: true,
            sendPasswordEmail: true,
            sendInvoiceEmail: true,
            // Added force flags to ensure database records are created
            forceCreateUser: true,
            createMembershipRecord: true,
            // Add timestamp to prevent caching
            timestamp: new Date().getTime()
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.url) {
        // Mark checkout as initiated to prevent duplicate submissions
        sessionStorage.setItem('checkout_initiated', 'true');
        setIsSubmitted(true);
        
        // Double check that email is stored
        const checkEmail = localStorage.getItem('signup_email');
        if (!checkEmail) {
          console.error("Email not found in localStorage after setting");
          localStorage.setItem('signup_email', email);
        }
        
        // Redirect directly to Stripe checkout URL
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem starting the checkout process",
        variant: "destructive",
      });
      
      // Don't clear localStorage on error - we might need to retry
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
