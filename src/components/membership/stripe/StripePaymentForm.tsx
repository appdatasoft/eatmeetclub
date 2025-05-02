
import React from "react";
import { 
  PaymentElement, 
  useStripe, 
  useElements,
  LinkAuthenticationElement
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [stripeKey, setStripeKey] = React.useState<string>('loading...');

  // Check if we're in Stripe live mode
  React.useEffect(() => {
    if (stripe) {
      // _keyMode is not in the type definitions but exists on the object
      const mode = stripe?.getElement?._key?.includes('pk_live') ? 'live' : 'test';
      setIsLiveMode(mode === 'live');
      
      // Get the key being used (safely)
      const key = stripe?.getElement?._key || '';
      setStripeKey(key);
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
      
      {/* Display the Stripe key being used */}
      <div className="mt-4 mb-4 text-xs text-gray-500 bg-gray-50 p-2 rounded-md break-all">
        <p><strong>Stripe Key:</strong> {stripeKey}</p>
        <p><strong>Mode:</strong> {isLiveMode ? "Live" : "Test"}</p>
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

export default StripePaymentForm;
