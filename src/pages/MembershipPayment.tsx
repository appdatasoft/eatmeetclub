import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useMembershipPayment } from "@/hooks/useMembershipPayment";
import PaymentStatusDisplay from "@/components/membership/PaymentStatusDisplay";
import PaymentVerificationHandler from "@/components/membership/PaymentVerificationHandler";
import DirectPaymentIntentLoader from "@/components/membership/DirectPaymentIntentLoader";
import PaymentContentArea from "@/components/membership/PaymentContentArea";
import StripeModeNotification from "@/components/membership/StripeModeNotification";
import EmailVerifier from "@/components/membership/EmailVerifier";
import { useStripeMode } from "@/hooks/membership/useStripeMode";

const MembershipPayment = () => {
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [directClientSecret, setDirectClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  const [verificationProcessed, setVerificationProcessed] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailMissingHandled, setEmailMissingHandled] = useState(false);
  
  const { isStripeTestMode, stripeCheckError, handleRetryStripeCheck } = useStripeMode();
  const directIntentId = searchParams.get('intent');
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';
  
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
    existingMembership,
    proratedAmount,
    handleSubmit,
    handleCancel,
    handlePaymentSuccess
  } = useMembershipPayment();

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

  // Use the session ID from the URL if available
  const finalSessionId = sessionId || hookSessionId;
  const finalPaymentSuccess = success || paymentSuccess;
  const finalPaymentCanceled = canceled || paymentCanceled;

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
        
        {/* Email verification component */}
        <EmailVerifier 
          paymentSuccess={finalPaymentSuccess}
          sessionId={finalSessionId}
          verificationProcessed={verificationProcessed}
          isRedirecting={isRedirecting}
          emailChecked={emailChecked}
          emailMissingHandled={emailMissingHandled}
          setEmailChecked={setEmailChecked}
          setEmailMissingHandled={setEmailMissingHandled}
          setIsRedirecting={setIsRedirecting}
          setVerificationProcessed={setVerificationProcessed}
        />
        
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
          <StripeModeNotification 
            isStripeTestMode={isStripeTestMode}
            stripeCheckError={stripeCheckError}
            onRetry={handleRetryStripeCheck}
          />
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
          existingMembership={existingMembership}
          proratedAmount={proratedAmount}
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
