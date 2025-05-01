
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SignupForm, { SignupFormValues } from "@/components/signup/SignupForm";
import PaymentForm from "@/components/signup/PaymentForm";
import Navbar from "@/components/layout/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useSignupActions } from "@/components/signup/hooks/useSignupActions";
import { PaymentVerification } from "@/components/signup/PaymentVerification";

const SignupContainer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userDetails, setUserDetails] = useState<SignupFormValues | null>(null);
  const [membershipFee] = useState(25);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const paymentCanceled = searchParams.get('canceled') === 'true';
  
  const { 
    isPaymentVerified, 
    isVerifyingPayment,
    handleSignupSubmit,
    handlePayment
  } = useSignupActions({
    setIsLoading,
    setUserDetails,
    setShowPaymentForm,
    setIsNotificationSent,
    toast,
    navigate
  });

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

              {isPaymentVerified && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <AlertDescription className="text-green-800">
                    Payment successful! Your membership has been activated. You'll be redirected to login shortly.
                  </AlertDescription>
                </Alert>
              )}

              <PaymentVerification
                isVerifying={isVerifyingPayment}
                isVerified={isPaymentVerified}
                isNotificationSent={isNotificationSent}
              />
              
              {!isVerifyingPayment && !isPaymentVerified && (
                !showPaymentForm ? (
                  <SignupForm 
                    onSubmit={handleSignupSubmit} 
                    isLoading={isLoading}
                  />
                ) : (
                  <PaymentForm 
                    userDetails={userDetails!}
                    membershipFee={membershipFee}
                    onBack={handleBack}
                    onSubmit={handlePayment}
                    isLoading={isLoading}
                    isSubscription={true}
                  />
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignupContainer;
