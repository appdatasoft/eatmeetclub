
import React from "react";
import { 
  PaymentElement, 
  useStripe, 
  useElements,
  Elements,
  LinkAuthenticationElement
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Load Stripe outside of a component to avoid recreating it on each render
// Using Stripe's test publishable key
const stripePromise = loadStripe("pk_test_51IkMKHBttGiztABC8RlNDjAaaAnoviPnHlOkymIEl0QosgW8yQpOeLeJQSzPyhJkokPFc1t4PsjSPpEaDYdIZS9000AXObBqtA");

interface StripePaymentFormProps {
  clientSecret: string;
  email: string;
  isProcessing: boolean;
  onPaymentSuccess: () => void;
}

const StripePaymentForm = ({ 
  clientSecret, 
  email, 
  isProcessing, 
  onPaymentSuccess 
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      console.error("Stripe not loaded yet");
      return;
    }
    
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/membership-payment?success=true',
      },
      redirect: 'if_required',
    });
    
    if (result.error) {
      // Show error to your customer
      setError(result.error.message || "An unknown error occurred");
      console.error("Payment error:", result.error);
    } else if (result.paymentIntent?.status === 'succeeded') {
      console.log("Payment succeeded:", result.paymentIntent.id);
      // Call the verify endpoint directly here
      onPaymentSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <LinkAuthenticationElement 
        options={{
          defaultValues: { email },
          // Remove the forgotEmailText property that's causing the error
          disabled: true,
        }}
      />
      <div className="my-4">
        <PaymentElement />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Subscribe Now - $25.00/month"
          )}
        </Button>
      </div>
    </form>
  );
};

interface StripePaymentElementProps {
  clientSecret: string | null;
  email: string;
  isProcessing: boolean;
  onPaymentSuccess: () => void;
}

const StripePaymentElement = ({ 
  clientSecret, 
  email, 
  isProcessing,
  onPaymentSuccess
}: StripePaymentElementProps) => {
  if (!clientSecret) {
    return null;
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
      />
    </Elements>
  );
};

export default StripePaymentElement;
