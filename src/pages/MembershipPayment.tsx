
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
  const [directClientSecret, setDirectClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);
  
  const {
    membershipFee,
    isLoading,
    isProcessing,
    paymentCanceled,
    paymentSuccess,
    sessionId,
    formErrors,
    networkError,
    clientSecret,
    handleSubmit,
    handleCancel,
    handlePaymentSuccess
  } = useMembershipPayment();

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
                  paymentSuccess={paymentSuccess}
                  sessionId={sessionId}
                  paymentCanceled={paymentCanceled}
                  networkError={networkError}
                  formErrors={formErrors}
                  stripeError={stripeError}
                  validationError={validationError}
                />
                
                {!paymentSuccess && directClientSecret && (
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
                
                {!paymentSuccess && !directClientSecret && (
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
