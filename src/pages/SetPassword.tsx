
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import PasswordForm, { PasswordFormValues } from "@/components/auth/PasswordForm";
import PasswordSuccessMessage from "@/components/auth/PasswordSuccessMessage";
import PasswordRecoveryHandler from "@/components/auth/PasswordRecoveryHandler";

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("Set Your Password");
  const [pageDescription, setPageDescription] = useState("Complete your membership by setting a password for your account");

  // Get token from query params - can be in either token or access_token parameter
  const token = searchParams.get('token') || searchParams.get('access_token');
  
  // Get email from query params if available (for the email link flow)
  const email = searchParams.get('email');

  // Check if this is an account activation flow
  useEffect(() => {
    if (!token && email) {
      setPageTitle("Activate Your Account");
      setPageDescription("Complete your account setup by creating a password");
    }
  }, [token, email]);

  useEffect(() => {
    if (!token && !email) {
      setError("Invalid or missing information. Please use the link from your email.");
      toast({
        title: "Missing information",
        description: "Please use the link from the email to activate your account.",
        variant: "destructive",
      });
    } else if (!token && email) {
      console.log("Email provided without token, will initiate account activation process:", email);
    }
  }, [token, toast, email]);

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!token) {
        throw new Error("Invalid or missing token");
      }

      console.log("Attempting to update password with token");

      const { error } = await supabase.auth.updateUser(
        { password: values.password },
      );

      if (error) {
        throw error;
      }

      setSuccess(true);
      
      toast({
        title: "Account activated successfully!",
        description: "Your account has been activated and you can now log in with your new password.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Password setup error:", error);
      setError(error.message || "Failed to set password. Please try again.");
      toast({
        title: "Error",
        description: error.message || "There was a problem activating your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 pt-16">
        <div className="max-w-md w-full">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl">{pageTitle}</CardTitle>
              <CardDescription>
                {pageDescription}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success ? (
                <PasswordSuccessMessage />
              ) : token ? (
                <PasswordForm onSubmit={onSubmit} isLoading={isLoading} />
              ) : email ? (
                <PasswordRecoveryHandler userEmail={email} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SetPassword;
