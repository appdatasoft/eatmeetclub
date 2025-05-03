
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StripeModeNotificationProps {
  isStripeTestMode: boolean | null;
  stripeCheckError: boolean;
  onRetry: () => void;
}

const StripeModeNotification: React.FC<StripeModeNotificationProps> = ({
  isStripeTestMode,
  stripeCheckError,
  onRetry
}) => {
  if (stripeCheckError) {
    return (
      <Alert variant="default" className="mb-4 bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="flex items-center justify-between">
          <span>Stripe mode verification failed. Using default test mode.</span>
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-2">
            <RefreshCcw className="h-4 w-4 mr-1" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (isStripeTestMode !== null && !stripeCheckError) {
    return (
      <div className={`py-2 px-4 text-center rounded-md mb-4 text-sm ${
        isStripeTestMode 
          ? "bg-blue-50 border border-blue-200 text-blue-700" 
          : "bg-amber-50 border border-amber-200 text-amber-700"
      }`}>
        {isStripeTestMode ? (
          <p>Stripe is in <strong>test mode</strong>. You can use test cards like 4242 4242 4242 4242.</p>
        ) : (
          <p><strong>Live payment environment</strong>. Please use a real payment card. Test cards will be declined.</p>
        )}
      </div>
    );
  }
  
  return null;
};

export default StripeModeNotification;
