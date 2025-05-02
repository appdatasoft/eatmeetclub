
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
import { useToast } from "@/hooks/use-toast";

// Load Stripe outside of a component to avoid recreating it on each render
// Use environment variable for the publishable key to switch between test and production
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51IkMKHBttGiztABC8RlNDjAaaAnoviPnHlOkymIEl0QosgW8yQpOeLeJQSzPyhJkokPFc1t4PsjSPpEaDYdIZS9000AXObBqtA";
const stripePromise = loadStripe(stripeKey);

interface StripePaymentFormProps {
  clientSecret: string;
  email: string;
  isProcessing: boolean;
  onPaymentSuccess: () => void;
  onPaymentError: (errorMessage: string) => void;
}

const StripePaymentForm = ({ 
  clientSecret, 
  email, 
  isProcessing, 
  onPaymentSuccess,
  onPaymentError
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [error, setError] = React.useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = React.useState<boolean>(false);

  // Check if we're in Stripe live mode
  React.useEffect(() => {
    if (stripe) {
      // @ts-ignore - _keyMode is not in the type definitions but exists on the object
      const mode = stripe._keyMode;
      setIsLiveMode(mode === 'live');
    }
  }, [stripe]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      console.error("Stripe not loaded yet");
      onPaymentError("Payment system is still initializing. Please try again in a moment.");
      return;
    }
    
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/membership-payment?success=true',
        },
        redirect: 'if_required',
      });
      
      if (result.error) {
        // Show error to your customer
        console.error("Payment error:", result.error);
        
        // Handle specific error cases
        if (result.error.code === 'card_declined' && result.error.message?.includes('test card')) {
          setError("Test cards can't be used in live mode. Please use a real card for payment.");
          onPaymentError("Test cards can't be used in live mode. Please use a real card for payment.");
          
          toast({
            title: "Payment failed",
            description: "Test cards can't be used in live mode. Please use a real card.",
            variant: "destructive",
          });
        } else {
          setError(result.error.message || "An unknown error occurred during payment processing");
          onPaymentError(result.error.message || "Payment failed. Please check your card details and try again.");
          
          toast({
            title: "Payment failed",
            description: result.error.message || "Please check your card details and try again",
            variant: "destructive",
          });
        }
      } else if (result.paymentIntent?.status === 'succeeded') {
        console.log("Payment succeeded:", result.paymentIntent.id);
        // Call the verify endpoint directly here
        onPaymentSuccess();
        
        toast({
          title: "Payment successful!",
          description: "Your membership is being activated",
        });
      }
    } catch (err: any) {
      console.error("Unexpected payment error:", err);
      setError("An unexpected error occurred. Please try again.");
      onPaymentError("An unexpected error occurred. Please try again or contact support.");
      
      toast({
        title: "Payment error",
        description: "Something went wrong with your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <LinkAuthenticationElement 
        options={{
          defaultValues: { email },
        }}
      />
      <div className="my-4">
        <PaymentElement />
      </div>
      {isLiveMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            <strong>Live Mode:</strong> Use a real payment card. Test cards will be declined.
          </p>
        </div>
      )}
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
  onPaymentError: (errorMessage: string) => void;
}

const StripePaymentElement = ({ 
  clientSecret, 
  email, 
  isProcessing,
  onPaymentSuccess,
  onPaymentError
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
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePaymentElement;
