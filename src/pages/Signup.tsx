
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SignupForm, { SignupFormValues } from "@/components/signup/SignupForm";
import PaymentForm from "@/components/signup/PaymentForm";
import Navbar from "@/components/layout/Navbar";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userDetails, setUserDetails] = useState<SignupFormValues | null>(null);
  const [membershipFee, setMembershipFee] = useState(25);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignupSubmit = (values: SignupFormValues) => {
    setUserDetails(values);
    setShowPaymentForm(true);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) return;
    
    setIsLoading(true);

    try {
      // Mock payment processing - in production this would call the Stripe API
      // Generate a mock payment ID
      const mockPaymentId = `payment_${Date.now()}`;
      
      // Call the Supabase Edge Function to verify membership payment
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId: mockPaymentId,
            email: userDetails.email,
            name: userDetails.email.split('@')[0], // Just using part of email as name for demo
            phone: userDetails.phoneNumber,
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Welcome to Eat Meet Club!",
          description: "Your membership has been activated. Please check your email to set your password.",
        });
        navigate("/login");
      } else {
        throw new Error(data.message || "Failed to activate membership");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem activating your membership",
        variant: "destructive",
      });
    } finally {
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
              <CardTitle className="text-2xl font-bold">Become a Member</CardTitle>
              <CardDescription>Join Eat Meet Club and start social dining</CardDescription>
            </CardHeader>
            
            <CardContent>
              {!showPaymentForm ? (
                <SignupForm onSubmit={handleSignupSubmit} />
              ) : (
                <PaymentForm 
                  userDetails={userDetails!}
                  membershipFee={membershipFee}
                  onBack={handleBack}
                  onSubmit={handlePayment}
                  isLoading={isLoading}
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
