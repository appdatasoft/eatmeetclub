
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, CreditCard } from "lucide-react";

interface PaymentAlertsProps {
  paymentSuccess: boolean;
  sessionId: string | null;
  paymentCanceled: boolean;
  formErrors?: {
    cardNumber?: boolean;
    cardExpiry?: boolean;
    cardCvc?: boolean;
  };
}

const PaymentAlerts = ({ 
  paymentSuccess, 
  sessionId, 
  paymentCanceled,
  formErrors 
}: PaymentAlertsProps) => {
  if (paymentSuccess && sessionId) {
    return (
      <Alert className="mb-6 bg-green-50 border-green-200">
        <Check className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Your payment was successful! Please check your email for login instructions.
        </AlertDescription>
      </Alert>
    );
  }

  if (paymentCanceled) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Payment was canceled. Please try again when you're ready.
        </AlertDescription>
      </Alert>
    );
  }

  if (formErrors && (formErrors.cardNumber || formErrors.cardExpiry || formErrors.cardCvc)) {
    return (
      <Alert variant="destructive" className="mb-4">
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          Please check your card details and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PaymentAlerts;
