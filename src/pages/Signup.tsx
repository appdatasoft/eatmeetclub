
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import SignupForm, { SignupFormValues } from "@/components/signup/SignupForm";
import PaymentForm from "@/components/signup/PaymentForm";
import Navbar from "@/components/layout/Navbar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userDetails, setUserDetails] = useState<SignupFormValues | null>(null);
  const [membershipFee] = useState(25);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const [isPaymentVerified, setIsPaymentVerified] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const paymentCanceled = searchParams.get('canceled') === 'true';
  const success = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');

  // Check if we need to verify a successful payment
  useEffect(() => {
    if (success && sessionId) {
      verifyPayment(sessionId);
    }
  }, [success, sessionId]);

  // Function to verify payment with the backend
  const verifyPayment = async (paymentId: string) => {
    setIsVerifyingPayment(true);
    setIsLoading(true);
    try {
      const email = localStorage.getItem('signup_email');
      const name = localStorage.getItem('signup_name');
      const phone = localStorage.getItem('signup_phone');
      
      if (!email || !name) {
        throw new Error("Missing user details for payment verification");
      }
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email, name, phone });
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            paymentId,
            email,
            name,
            phone: phone || null,
            isSubscription: true
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }
      
      console.log("Payment verification response:", data);
      
      if (data.success) {
        setIsPaymentVerified(true);
        toast({
          title: "Payment successful!",
          description: "Your membership has been activated.",
        });
        
        // Clean up localStorage
        setTimeout(() => {
          localStorage.removeItem('signup_email');
          localStorage.removeItem('signup_name');
          localStorage.removeItem('signup_phone');
          
          // Redirect to login
          navigate("/login?verified=true");
        }, 3000);
      } else {
        throw new Error(data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem verifying your payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsVerifyingPayment(false);
    }
  };

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      // Store the user details for later use in payment verification
      localStorage.setItem('signup_email', values.email);
      localStorage.setItem('signup_name', values.email.split('@')[0]); // Using part of email as name since we don't collect full name
      if (values.phoneNumber) {
        localStorage.setItem('signup_phone', values.phoneNumber);
      }

      // Register the user in Supabase Auth
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            phone: values.phoneNumber || null,
          },
        },
      });

      if (error) throw error;

      // Send notification via the edge function
      const notificationResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-member-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            name: values.email.split('@')[0], // Just using part of email as name
            phone: values.phoneNumber,
          }),
        }
      );

      if (notificationResponse.ok) {
        setIsNotificationSent(true);
        toast({
          title: "Confirmation sent!",
          description: "We've sent you an email and text confirmation.",
        });
      }

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });

      // Proceed to payment form
      setUserDetails(values);
      setShowPaymentForm(true);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) return;
    
    setIsLoading(true);

    try {
      console.log("Initiating payment process with user details:", userDetails.email);
      
      // Create a Stripe checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
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
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = "Failed to create checkout session";
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.success && data.url) {
        // Redirect to the Stripe checkout page
        console.log("Redirecting to:", data.url);
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

              {isPaymentVerified && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <AlertDescription className="text-green-800">
                    Payment successful! Your membership has been activated. You'll be redirected to login shortly.
                  </AlertDescription>
                </Alert>
              )}

              {isVerifyingPayment && (
                <div className="text-center py-6">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Verifying your payment...</p>
                </div>
              )}

              {isNotificationSent && !isVerifyingPayment && !isPaymentVerified && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    We've sent you a confirmation email and text message! Please proceed to payment to complete your membership.
                  </AlertDescription>
                </Alert>
              )}
              
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

export default Signup;
