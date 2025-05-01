
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignupFormValues } from "@/components/signup/SignupForm";
import Navbar from "@/components/layout/Navbar";
import { useSignupActions } from "@/components/signup/hooks/useSignupActions";
import { PaymentVerification } from "@/components/signup/PaymentVerification";
import AuthHeader from "@/components/signup/AuthHeader";
import PaymentCanceledAlert from "@/components/signup/PaymentCanceledAlert";
import PaymentSuccessAlert from "@/components/signup/PaymentSuccessAlert";
import SignupFormContainer from "@/components/signup/SignupFormContainer";
import useAuth from "@/hooks/useAuth";

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
  const directToPayment = searchParams.get('payment') === 'true';
  
  const { user } = useAuth();
  
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

  // If logged in user accesses this page directly with payment=true parameter,
  // skip to payment step
  useEffect(() => {
    if (user && directToPayment && !showPaymentForm && !isVerifyingPayment && !isPaymentVerified) {
      console.log("Logged-in user accessing signup - skip to payment form");
      // Create minimal user details from auth user
      setUserDetails({
        email: user.email || '',
        password: '', // Not needed since user is already logged in
        phoneNumber: user.user_metadata?.phone || ''
      });
      setShowPaymentForm(true);
    }
  }, [user, directToPayment, showPaymentForm, isVerifyingPayment, isPaymentVerified]);

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
              <AuthHeader />
            </CardHeader>
            
            <CardContent>
              {paymentCanceled && <PaymentCanceledAlert />}
              {isPaymentVerified && <PaymentSuccessAlert />}

              <PaymentVerification
                isVerifying={isVerifyingPayment}
                isVerified={isPaymentVerified}
                isNotificationSent={isNotificationSent}
              />
              
              {!isVerifyingPayment && !isPaymentVerified && (
                <SignupFormContainer
                  showPaymentForm={showPaymentForm}
                  isLoading={isLoading}
                  userDetails={userDetails}
                  membershipFee={membershipFee}
                  handleSignupSubmit={handleSignupSubmit}
                  handlePayment={handlePayment}
                  handleBack={handleBack}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignupContainer;
