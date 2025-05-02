
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripePaymentForm from "./StripePaymentForm";
import { useStripePublishableKey } from "./useStripePublishableKey";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [stripeInstance, setStripeInstance] = React.useState<any>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  // Load Stripe instance when the publishable key is available
  React.useEffect(() => {
    if (stripePublishableKey && !stripeInstance) {
      const loadStripeInstance = async () => {
        try {
          const stripe = await loadStripe(stripePublishableKey);
          setStripeInstance(stripe);
          setLoadError(null);
        } catch (err: any) {
          console.error("Error loading Stripe:", err);
          setLoadError(err.message || "Failed to initialize payment system");
        }
      };
      
      loadStripeInstance();
    }
  }, [stripePublishableKey, stripeInstance]);

  const handleRetry = () => {
    // Reset states to trigger a reload
    setStripeInstance(null);
    setLoadError(null);
    setRetryCount(count => count + 1);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-4" />
        <p className="text-center text-gray-600">Loading payment system...</p>
      </div>
    );
  }

  if (error || loadError) {
    return (
      <div className="p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || loadError}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-center text-gray-600">
            We're having trouble connecting to our payment system.
          </p>
          <Button onClick={handleRetry} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!stripePublishableKey) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Payment system configuration is missing. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Payment process not initiated. Please complete the previous steps.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stripeInstance) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500 mb-4" />
        <p className="text-center text-gray-600">Initializing payment system...</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0A5A55',
      },
    },
  };

  return (
    <Elements stripe={stripeInstance} options={options} key={clientSecret}>
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
