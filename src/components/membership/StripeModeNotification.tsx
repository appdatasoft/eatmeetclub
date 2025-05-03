
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface StripeModeNotificationProps {
  isStripeTestMode: boolean;
  stripeCheckError: boolean;
  onRetry: () => void;
}

const StripeModeNotification = ({
  isStripeTestMode,
  stripeCheckError,
  onRetry
}: StripeModeNotificationProps) => {
  if (stripeCheckError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment System Warning</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            We couldn't check the payment system mode. Using test mode by default.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit flex items-center" 
            onClick={onRetry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!isStripeTestMode) {
    return (
      <Alert variant="default" className="bg-amber-50 border-amber-200 mb-4">
        <AlertTitle className="text-amber-800">Live Payment Mode</AlertTitle>
        <AlertDescription className="text-amber-700">
          Payment system is in live mode. Real charges will be applied.
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
      <AlertTitle className="text-blue-800">Test Payment Mode</AlertTitle>
      <AlertDescription className="text-blue-700">
        Payment system is in test mode. No real charges will be applied.
      </AlertDescription>
    </Alert>
  );
};

export default StripeModeNotification;
