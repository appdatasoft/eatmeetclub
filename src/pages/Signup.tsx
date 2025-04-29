
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SignupForm, { SignupFormValues } from "@/components/signup/SignupForm";
import PaymentForm from "@/components/signup/PaymentForm";
import Navbar from "@/components/layout/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userDetails, setUserDetails] = useState<SignupFormValues | null>(null);
  const [membershipFee] = useState(25);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const paymentCanceled = searchParams.get('canceled') === 'true';

  const handleSignupSubmit = (values: SignupFormValues) => {
    setUserDetails(values);
    setShowPaymentForm(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) return;
    
    setIsLoading(true);

    try {
      // Create a Stripe checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userDetails.email,
            name: userDetails.email.split('@')[0], // Just using part of email as name for demo
            phone: userDetails.phoneNumber,
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirect to the Stripe checkout page
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem initiating the checkout process",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowPaymentForm(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="max-w-md w-full">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Monthly Membership</CardTitle>
              <CardDescription>Subscribe to Eat Meet Club for $25/month</CardDescription>
            </CardHeader>
            
            <CardContent>
              {paymentCanceled && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Payment was canceled. Please try again when you're ready.
                  </AlertDescription>
                </Alert>
              )}
              
              {!showPaymentForm ? (
                <SignupForm onSubmit={handleSignupSubmit} />
              ) : (
                <PaymentForm 
                  userDetails={userDetails!}
                  membershipFee={membershipFee}
                  onBack={handleBack}
                  onSubmit={handlePayment}
                  isLoading={isLoading}
                  isSubscription={true}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Signup;
