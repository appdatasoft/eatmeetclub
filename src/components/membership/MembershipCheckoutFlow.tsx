
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface MembershipCheckoutFlowProps {
  isSubmitted: boolean;
  setIsSubmitted: (value: boolean) => void;
}

const MembershipCheckoutFlow: React.FC<MembershipCheckoutFlowProps> = ({
  isSubmitted,
  setIsSubmitted
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effect to prevent repeat submissions or navigation back to this page after checkout initiated
  useEffect(() => {
    const checkoutInitiated = sessionStorage.getItem('checkout_initiated');
    
    if (checkoutInitiated === 'true') {
      // Check if we have email stored before redirecting
      const storedEmail = localStorage.getItem('signup_email');
      if (!storedEmail) {
        console.log("Checkout was initiated but no email found, resetting checkout flag");
        sessionStorage.removeItem('checkout_initiated');
        toast({
          title: "Missing information",
          description: "Your signup information is incomplete. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Redirect to membership payment page to handle post-payment flow
      navigate('/membership-payment');
    }
    
    return () => {
      // Clean up localStorage data when component unmounts if not submitted
      if (!isSubmitted) {
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_address');
      }
    };
  }, [navigate, isSubmitted, toast, setIsSubmitted]);

  return null; // This is a logic-only component, no UI
};

export default MembershipCheckoutFlow;
