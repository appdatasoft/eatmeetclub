
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StripeModeNotificationProps {
  isStripeTestMode: boolean;
  stripeCheckError: string | null;
  onRetry: () => void;
}

const StripeModeNotification: React.FC<StripeModeNotificationProps> = ({
  isStripeTestMode,
  stripeCheckError,
  onRetry
}) => {
  // If there was an error checking Stripe mode, show an error alert
  if (stripeCheckError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to check payment mode</AlertTitle>
        <AlertDescription className="flex flex-col space-y-2">
          <span>We couldn't determine if the payment system is in test or live mode.</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-fit" 
            onClick={onRetry}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // If in test mode, show a test mode warning
  if (isStripeTestMode) {
    return (
      <Alert variant="warning" className="mb-4 border-yellow-400 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-700">Test Mode Active</AlertTitle>
        <AlertDescription className="text-yellow-600">
          The payment system is currently in test mode. No real charges will be processed.
          For testing, you can use card number 4242 4242 4242 4242 with any future expiry date and CVC.
        </AlertDescription>
      </Alert>
    );
  }

  // If in live mode, show a subtle confirmation
  return (
    <Alert variant="default" className="mb-4 border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-700">Live Mode Active</AlertTitle>
      <AlertDescription className="text-green-600">
        The payment system is in live mode. Real transactions will be processed.
      </AlertDescription>
    </Alert>
  );
};

export default StripeModeNotification;
