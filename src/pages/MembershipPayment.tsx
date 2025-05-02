
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useMembershipPayment } from "@/hooks/useMembershipPayment";
import PaymentStatusDisplay from "@/components/membership/PaymentStatusDisplay";
import PaymentVerificationHandler from "@/components/membership/PaymentVerificationHandler";
import DirectPaymentIntentLoader from "@/components/membership/DirectPaymentIntentLoader";
import PaymentContentArea from "@/components/membership/PaymentContentArea";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const MembershipPayment = () => {
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const directIntentId = searchParams.get('intent');
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';
  const [directClientSecret, setDirectClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [verificationProcessed, setVerificationProcessed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailMissingHandled, setEmailMissingHandled] = useState(false);
  const [isStripeTestMode, setIsStripeTestMode] = useState<boolean | null>(null);
  const [stripeCheckError, setStripeCheckError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  
  const {
    membershipFee,
    isLoading,
    isProcessing,
    paymentCanceled,
    paymentSuccess,
    sessionId: hookSessionId,
    formErrors,
    networkError,
    clientSecret,
    handleSubmit,
    handleCancel,
    handlePaymentSuccess
  } = useMembershipPayment();

  // Check if we're in Stripe test mode
  useEffect(() => {
    const checkStripeMode = async () => {
      if (isRetrying) {
        setIsRetrying(false);
      }
      
      try {
        setStripeCheckError(false);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/check-stripe-mode`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-cache"
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setIsStripeTestMode(data.isTestMode);
        } else {
          // Non-critical error, just log and continue
          console.warn("Non-critical error checking Stripe mode:", response.status);
          setStripeCheckError(true);
          // Default to assuming test mode
          setIsStripeTestMode(true);
        }
      } catch (error) {
        console.error("Error checking Stripe mode:", error);
        setStripeCheckError(true);
        // Default to assuming we're in test mode if we can't determine
        setIsStripeTestMode(true);
      }
    };
    
    checkStripeMode();
  }, [isRetrying]);

  // Use the session ID from the URL if available
  const finalSessionId = sessionId || hookSessionId;
  const finalPaymentSuccess = success || paymentSuccess;
  const finalPaymentCanceled = canceled || paymentCanceled;

  // Check for email presence on component mount and set up verification
  useEffect(() => {
    if (emailChecked || emailMissingHandled) return;
    
    setEmailChecked(true);
    
    // When showing the verification UI, make sure email exists in localStorage
    if (finalPaymentSuccess && finalSessionId && !verificationProcessed && !isRedirecting) {
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
  }, [finalPaymentSuccess, finalSessionId, verificationProcessed, toast, navigate, isRedirecting, emailChecked, emailMissingHandled]);

  // Set verification processed flag to true if we detect the success parameter but no session ID
  // This prevents multiple verification attempts
  useEffect(() => {
    if (success && !sessionId && !verificationProcessed) {
      setVerificationProcessed(true);
    }
  }, [success, sessionId, verificationProcessed]);

  const handlePaymentError = (errorMessage: string) => {
    setStripeError(errorMessage);
    console.error("Payment error:", errorMessage);
    
    // Check for test card in live mode error
    if (errorMessage.includes('test card') && errorMessage.includes('live mode')) {
      toast({
        title: "Card Error",
        description: "You're using a test card in live mode. Please use a real payment card.",
        variant: "destructive",
      });
    }
  };

  const handleRetryStripeCheck = () => {
    setIsRetrying(true);
  };

  // Fix TS error by creating a wrapper function that doesn't return a value
  const onSubmitWrapper = async (values: any) => {
    setValidationError(null);
    try {
      await handleSubmit(values);
    } catch (error: any) {
      setValidationError(error.message || "An error occurred during form submission");
    }
  };

  // Show loading state while fetching data
  if (isLoading || isLoadingIntent) {
    return <PaymentStatusDisplay />;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        {/* Handle payment verification via URL parameters */}
        {finalSessionId && finalPaymentSuccess && (
          <PaymentVerificationHandler
            sessionId={finalSessionId}
            paymentSuccess={finalPaymentSuccess}
            verificationProcessed={verificationProcessed}
            setVerificationProcessed={setVerificationProcessed}
          />
        )}
        
        {/* Handle direct payment intent loading from URL */}
        <DirectPaymentIntentLoader
          directIntentId={directIntentId}
          directClientSecret={directClientSecret}
          setDirectClientSecret={setDirectClientSecret}
          setIsLoadingIntent={setIsLoadingIntent}
          setValidationError={setValidationError}
        />
        
        {/* Display Stripe mode notification if available */}
        <div className="container-custom mb-4">
          {stripeCheckError && (
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="flex items-center justify-between">
                <span>Could not verify payment system mode. Some features may be limited.</span>
                <Button variant="outline" size="sm" onClick={handleRetryStripeCheck} className="ml-2">
                  <RefreshCcw className="h-4 w-4 mr-1" /> Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {isStripeTestMode !== null && !stripeCheckError && (
            <div className={`py-2 px-4 text-center rounded-md mb-4 text-sm ${
              isStripeTestMode 
                ? "bg-blue-50 border border-blue-200 text-blue-700" 
                : "bg-amber-50 border border-amber-200 text-amber-700"
            }`}>
              {isStripeTestMode ? (
                <p>Stripe is in <strong>test mode</strong>. You can use test cards like 4242 4242 4242 4242.</p>
              ) : (
                <p><strong>Live payment environment</strong>. Please use a real payment card. Test cards will be declined.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Main payment content area */}
        <PaymentContentArea
          paymentSuccess={finalPaymentSuccess}
          sessionId={finalSessionId}
          paymentCanceled={finalPaymentCanceled}
          networkError={networkError}
          formErrors={formErrors}
          stripeError={stripeError}
          validationError={validationError}
          directClientSecret={directClientSecret}
          isProcessing={isProcessing}
          membershipFee={membershipFee}
          handlePaymentSuccess={handlePaymentSuccess}
          handlePaymentError={handlePaymentError}
          handleSubmit={onSubmitWrapper}
          handleCancel={handleCancel}
          clientSecret={clientSecret}
        />
      </div>
      <Footer />
    </>
  );
};

export default MembershipPayment;
