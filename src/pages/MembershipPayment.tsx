
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MembershipPaymentForm from "@/components/membership/MembershipPaymentForm";
import PaymentAlerts from "@/components/membership/PaymentAlerts";
import { useMembershipPayment } from "@/hooks/useMembershipPayment";
import StripePaymentElement from "@/components/membership/StripePaymentElement";

const MembershipPayment = () => {
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const directIntentId = searchParams.get('intent');
  const sessionId = searchParams.get('session_id');
  const success = searchParams.get('success') === 'true';
  const canceled = searchParams.get('canceled') === 'true';
  const [directClientSecret, setDirectClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  
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

  // Use the session ID from the URL if available
  const finalSessionId = sessionId || hookSessionId;
  const finalPaymentSuccess = success || paymentSuccess;
  const finalPaymentCanceled = canceled || paymentCanceled;

  // Effect to verify successful Stripe checkout completion
  useEffect(() => {
    const verifyCheckoutCompletion = async () => {
      if (finalSessionId && finalPaymentSuccess) {
        try {
          // Get user details from localStorage
          const storedEmail = localStorage.getItem('signup_email');
          const storedName = localStorage.getItem('signup_name');
          
          if (!storedEmail) {
            throw new Error("Missing email for payment verification");
          }
          
          // Call the verify endpoint to confirm subscription
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId: finalSessionId,
                email: storedEmail,
                name: storedName || 'Guest User',
                isSubscription: true
              }),
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Payment verification failed");
          }
        } catch (error: any) {
          console.error("Error verifying checkout completion:", error);
          setValidationError(error.message || "There was a problem verifying your payment");
        }
      }
    };
    
    verifyCheckoutCompletion();
  }, [finalSessionId, finalPaymentSuccess]);

  // Load direct intent if provided in URL
  useEffect(() => {
    const loadDirectIntent = async () => {
      if (directIntentId) {
        setIsLoadingIntent(true);
        try {
          // Fetch the client secret for this payment intent
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/get-payment-intent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentIntentId: directIntentId,
                email: localStorage.getItem('signup_email') || 'guest@example.com'
              }),
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.clientSecret) {
              setDirectClientSecret(data.clientSecret);
            } else {
              setValidationError("Could not retrieve payment information. Please try again.");
            }
          } else {
            setValidationError("Error retrieving payment details. Please try again.");
          }
        } catch (error) {
          console.error("Error loading payment intent:", error);
          setValidationError("Failed to load payment information. Please try again.");
        } finally {
          setIsLoadingIntent(false);
        }
      }
    };
    
    loadDirectIntent();
  }, [directIntentId]);

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

  // Show loading state while fetching data
  if (isLoading || isLoadingIntent) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 bg-brand-500 text-white">
                <h1 className="text-2xl font-bold">Become a Member</h1>
                <p className="mt-1 text-white/90">Join our exclusive community for just ${membershipFee.toFixed(2)}/month</p>
              </div>
              
              <div className="p-6">
                <PaymentAlerts 
                  paymentSuccess={finalPaymentSuccess}
                  sessionId={finalSessionId}
                  paymentCanceled={finalPaymentCanceled}
                  networkError={networkError}
                  formErrors={formErrors}
                  stripeError={stripeError}
                  validationError={validationError}
                />
                
                {!finalPaymentSuccess && directClientSecret && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-4">Complete your membership payment</h3>
                      <p className="mb-6">You're just one step away from joining our community!</p>
                      <StripePaymentElement
                        clientSecret={directClientSecret}
                        email={localStorage.getItem('signup_email') || 'guest@example.com'}
                        isProcessing={isProcessing}
                        onPaymentSuccess={handlePaymentSuccess}
                        onPaymentError={handlePaymentError}
                      />
                    </div>
                  </>
                )}
                
                {!finalPaymentSuccess && !directClientSecret && !finalSessionId && (
                  <MembershipPaymentForm
                    membershipFee={membershipFee}
                    onSubmit={onSubmitWrapper}
                    onCancel={handleCancel}
                    isProcessing={isProcessing}
                    clientSecret={clientSecret}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MembershipPayment;
