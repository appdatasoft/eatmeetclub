
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignupFormValues } from "@/components/signup/SignupForm";
import Navbar from "@/components/layout/Navbar";
import useSignupActions from "@/hooks/signup/useSignupActions";
import { PaymentVerification } from "@/components/signup/PaymentVerification";
import AuthHeader from "@/components/signup/AuthHeader";
import PaymentCanceledAlert from "@/components/signup/PaymentCanceledAlert";
import PaymentSuccessAlert from "@/components/signup/PaymentSuccessAlert";
import SignupForm from "@/components/signup/SignupForm";
import useAuth from "@/hooks/useAuth";
import Footer from "@/components/layout/Footer";

const SignupContainer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const paymentCanceled = searchParams.get('canceled') === 'true';
  const paymentSuccess = searchParams.get('success') === 'true';
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard');
    return null;
  }
  
  const { 
    isLoading, 
    isVerifying, 
    isVerified, 
    isNotificationSent,
    handleSignupSubmit 
  } = useSignupActions({ navigate });

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16 pb-16">
        <div className="max-w-md w-full">
          <Card className="shadow-md">
            <CardHeader>
              <AuthHeader />
            </CardHeader>
            
            <CardContent>
              {paymentCanceled && <PaymentCanceledAlert />}
              {paymentSuccess && <PaymentSuccessAlert />}

              <PaymentVerification
                isVerifying={isVerifying}
                isVerified={isVerified}
                isNotificationSent={isNotificationSent}
              />
              
              {!isVerifying && !isVerified && (
                <SignupForm
                  onSubmit={handleSignupSubmit}
                  isLoading={isLoading}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignupContainer;
