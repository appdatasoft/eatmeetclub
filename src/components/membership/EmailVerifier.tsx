
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface EmailVerifierProps {
  paymentSuccess: boolean;
  sessionId: string | null;
  verificationProcessed: boolean;
  isRedirecting: boolean;
  emailChecked: boolean;
  emailMissingHandled: boolean;
  setEmailChecked: (value: boolean) => void;
  setEmailMissingHandled: (value: boolean) => void;
  setIsRedirecting: (value: boolean) => void;
  setVerificationProcessed: (value: boolean) => void;
}

const EmailVerifier: React.FC<EmailVerifierProps> = ({
  paymentSuccess,
  sessionId,
  verificationProcessed,
  isRedirecting,
  emailChecked,
  emailMissingHandled,
  setEmailChecked,
  setEmailMissingHandled,
  setIsRedirecting,
  setVerificationProcessed
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (emailChecked || emailMissingHandled) return;
    
    setEmailChecked(true);
    
    // When showing the verification UI, make sure email exists in localStorage
    if (paymentSuccess && sessionId && !verificationProcessed && !isRedirecting) {
      const storedEmail = localStorage.getItem('signup_email');
      if (!storedEmail) {
        console.error("Missing email in localStorage for payment verification");
        setEmailMissingHandled(true);
        
        toast({
          title: "Missing information",
          description: "We couldn't find your email information. Please try signing up again.",
          variant: "destructive",
        });
        
        // Set verification as processed to prevent infinite loop
        setVerificationProcessed(true);
        setIsRedirecting(true);
        
        // Try to retrieve email from session storage as fallback
        const sessionEmail = sessionStorage.getItem('signup_email');
        if (sessionEmail) {
          console.log("Found email in sessionStorage, restoring to localStorage");
          localStorage.setItem('signup_email', sessionEmail);
          setEmailMissingHandled(false);
          setEmailChecked(false);
          return;
        }
        
        // Redirect back to become-member page after a delay
        setTimeout(() => {
          navigate('/become-member');
        }, 3000);
      }
    }
  }, [paymentSuccess, sessionId, verificationProcessed, toast, navigate, isRedirecting, emailChecked, emailMissingHandled, setEmailChecked, setEmailMissingHandled, setVerificationProcessed, setIsRedirecting]);

  return null;
};

export default EmailVerifier;
