
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, CreditCard, Wifi, ShieldAlert, XCircle } from "lucide-react";

interface PaymentAlertsProps {
  paymentSuccess: boolean;
  sessionId: string | null;
  paymentCanceled: boolean;
  networkError?: string | null;
  formErrors?: {
    cardNumber?: boolean;
    cardExpiry?: boolean;
    cardCvc?: boolean;
  };
  stripeError?: string | null;
  validationError?: string | null;
}

const PaymentAlerts = ({ 
  paymentSuccess, 
  sessionId, 
  paymentCanceled,
  networkError,
  formErrors,
  stripeError,
  validationError
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
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Payment was canceled. Please try again when you're ready.
        </AlertDescription>
      </Alert>
    );
  }

  if (networkError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <Wifi className="h-4 w-4" />
        <AlertDescription>
          {networkError}
        </AlertDescription>
      </Alert>
    );
  }

  if (validationError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {validationError}
        </AlertDescription>
      </Alert>
    );
  }

  if (stripeError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription>
          {stripeError}
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
