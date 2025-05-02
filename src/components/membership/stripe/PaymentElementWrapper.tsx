
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";
import StripePaymentForm from "./StripePaymentForm";
import { useStripePublishableKey } from "./useStripePublishableKey";

// Initialize stripePromise as null, we'll set it when we have the key
let stripePromise: Promise<any> | null = null;

interface PaymentElementWrapperProps {
  clientSecret: string | null;
  email: string;
  isProcessing: boolean;
  onPaymentSuccess: () => void;
  onPaymentError: (errorMessage: string) => void;
}

const PaymentElementWrapper = ({
  clientSecret,
  email,
  isProcessing,
  onPaymentSuccess,
  onPaymentError
}: PaymentElementWrapperProps) => {
  const { stripePublishableKey, isLoading, error } = useStripePublishableKey();

  // Initialize Stripe with the retrieved key
  React.useEffect(() => {
    if (stripePublishableKey && !stripePromise) {
      stripePromise = loadStripe(stripePublishableKey);
    }
  }, [stripePublishableKey]);

  if (!clientSecret) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading payment system...</span>
      </div>
    );
  }

  if (error || !stripePromise) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p className="font-medium">Payment system error</p>
        <p>{error || "Unable to load the payment system. Please try again later."}</p>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6941C6',
            colorBackground: '#ffffff',
            colorText: '#1F2937',
          },
        },
      }}
    >
      <StripePaymentForm 
        clientSecret={clientSecret} 
        email={email} 
        isProcessing={isProcessing} 
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default PaymentElementWrapper;
