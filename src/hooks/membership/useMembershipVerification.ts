
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const useMembershipVerification = (sessionId: string | null) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if email exists and has active membership
  const verifyEmailAndMembershipStatus = async (email: string, restaurantId?: string) => {
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

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;

      setIsVerifying(true);
      setVerificationError(null);

      try {
        // Get user email from session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error("Unable to get session: " + sessionError.message);
        }
        
        const userEmail = sessionData?.session?.user?.email;
        
        if (!userEmail) {
          throw new Error("No user email found in session");
        }
        
        // Call function to verify the payment
        const { data, error } = await supabase.functions.invoke('verify-membership-payment', {
          body: { 
            sessionId,
            email: userEmail
          }
        });

        if (error) throw new Error(error.message);

        if (!data?.success) {
          throw new Error(data?.message || "Payment verification failed");
        }

        // Store the user ID if returned
        if (data.userId) {
          setUserId(data.userId);
        }

        setIsVerified(true);
        
        toast({
          title: "Payment Verified",
          description: "Your membership payment has been successfully verified.",
        });

      } catch (error: any) {
        console.error("Payment verification error:", error);
        setVerificationError(error.message);

        toast({
          title: "Verification Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    };

    if (sessionId && !isVerified && !isVerifying) {
      verifyPayment();
    }
  }, [sessionId, toast, isVerified, isVerifying]);

  return {
    isVerifying,
    isVerified,
    verificationError,
    userId,
    verifyEmailAndMembershipStatus,
    handleExistingMember
  };
};

export default useMembershipVerification;
