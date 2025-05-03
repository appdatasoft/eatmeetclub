
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState(false);

  // Get token from query params - can be in either token or access_token parameter
  const token = searchParams.get('token') || searchParams.get('access_token');
  
  // Check for error parameters that indicate an expired or invalid token
  const errorCode = searchParams.get('error_code') || searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  // Get email from query params if available (for the email link flow)
  const email = searchParams.get('email');

  // Check if tokens are in URL hash (Supabase sometimes puts it there)
  useEffect(() => {
    // First check for error conditions
    if (errorCode) {
      console.log("Error detected in URL params:", errorCode, errorDescription);
      setIsTokenExpired(true);
      setError(errorDescription || "The link is invalid or has expired. Please request a new password reset link.");
      
      // If we have an email and there's an error, we can offer to send a new link
      if (email && (errorCode === 'otp_expired' || errorCode === 'access_denied')) {
        console.log("Token expired for email:", email);
      }
      return;
    }
    
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashAccessToken = hashParams.get('access_token');
    const hashRefreshToken = hashParams.get('refresh_token');
    const hashError = hashParams.get('error');
    
    // Check for errors in the hash as well
    if (hashError) {
      console.log("Error detected in URL hash:", hashError);
      setIsTokenExpired(true);
      setError("The link is invalid or has expired. Please request a new password reset link.");
      return;
    }

    if (hashAccessToken) {
      setAccessToken(hashAccessToken);
      if (hashRefreshToken) {
        setRefreshToken(hashRefreshToken);
        // If we have both tokens, set the session
        supabase.auth.setSession({
          access_token: hashAccessToken,
          refresh_token: hashRefreshToken
        }).catch(error => {
          console.error("Error setting session:", error);
          setError("Unable to verify your session. Please request a new password reset link.");
        });
      }
    } else if (token) {
      setAccessToken(token);
    }
  }, [token, errorCode, errorDescription, email]);

  // Check if this is an account activation flow
  useEffect(() => {
    if (!accessToken && !token && email) {
      setPageTitle("Activate Your Account");
      setPageDescription("Complete your account setup by creating a password");
    }
  }, [accessToken, token, email]);

  useEffect(() => {
    if (!accessToken && !token && !email && !isTokenExpired) {
      setError("Invalid or missing information. Please use the link from your email.");
      toast({
        title: "Missing information",
        description: "Please use the link from the email to reset your password or activate your account.",
        variant: "destructive",
      });
    } else if (!accessToken && !token && email) {
      console.log("Email provided without token, will initiate account activation process:", email);
    }
  }, [accessToken, token, toast, email, isTokenExpired]);

  const onSubmit = async (values: PasswordFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!accessToken && !token) {
        throw new Error("Invalid or missing token");
      }

      console.log("Attempting to update password with token");

      // Use updateUser without the accessToken in options
      // If we've already set the session above using setSession(), this will work
      // Otherwise, it will use the token that's part of the current session
      const { error } = await supabase.auth.updateUser({ 
        password: values.password 
      });

      if (error) {
        throw error;
      }

      // Attempt to sign in user automatically if we have email
      if (email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: values.password,
        });
        
        if (signInError) {
          console.log("Auto sign-in failed, user will need to log in manually:", signInError.message);
        }
      }

      setSuccess(true);
      
      toast({
        title: "Password updated successfully!",
        description: "Your password has been updated and you can now log in with your new password.",
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
        description: error.message || "There was a problem updating your password.",
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
              ) : (accessToken || token) ? (
                <PasswordForm onSubmit={onSubmit} isLoading={isLoading} />
              ) : email ? (
                <PasswordRecoveryHandler userEmail={email} />
              ) : isTokenExpired && (
                <div className="text-center py-4">
                  <p className="mb-4">Your password reset link has expired. Please request a new one.</p>
                  <PasswordRecoveryHandler userEmail={email || ""} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SetPassword;
