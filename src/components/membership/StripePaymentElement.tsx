
import React from "react";
import PaymentElementWrapper from "./stripe/PaymentElementWrapper";

interface StripePaymentElementProps {
  clientSecret: string | null;
  email: string;
  isProcessing: boolean;
  onPaymentSuccess: () => void;
  onPaymentError: (errorMessage: string) => void;
}

const StripePaymentElement = ({ 
  clientSecret, 
  email, 
  isProcessing,
  onPaymentSuccess,
  onPaymentError
}: StripePaymentElementProps) => {
  return (
    <PaymentElementWrapper
      clientSecret={clientSecret}
      email={email}
      isProcessing={isProcessing}
      onPaymentSuccess={onPaymentSuccess}
      onPaymentError={onPaymentError}
    />
  );
};

export default StripePaymentElement;
