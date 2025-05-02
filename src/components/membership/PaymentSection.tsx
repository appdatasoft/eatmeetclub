
import React from "react";
import StripePaymentElement from "./StripePaymentElement";

interface PaymentSectionProps {
  clientSecret: string | null;
  email: string;
  isProcessing: boolean;
  onPaymentSuccess: () => void;
}

const PaymentSection = ({ 
  clientSecret, 
  email, 
  isProcessing, 
  onPaymentSuccess 
}: PaymentSectionProps) => {
  if (!clientSecret) {
    return null;
  }

  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-medium mb-4">Payment Details</h3>
      <StripePaymentElement
        clientSecret={clientSecret}
        email={email}
        isProcessing={isProcessing}
        onPaymentSuccess={onPaymentSuccess}
      />
    </div>
  );
};

export default PaymentSection;
