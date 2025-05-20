import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import PasswordForm from "@/components/auth/PasswordForm";
import PasswordSuccessMessage from "@/components/auth/PasswordSuccessMessage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PasswordFormValues } from "@/components/auth/PasswordForm";

const SetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    // Get error information from URL if present
    const urlError = searchParams.get("error");
    const urlErrorDesc = searchParams.get("error_description");

    if (urlError) {
      const errorMessage = urlErrorDesc 
        ? decodeURIComponent(urlErrorDesc.replace(/\+/g, ' ')) 
        : "Invalid or expired password reset link. Please request a new one.";
        
      setError(errorMessage);
      console.error("Error from URL:", { urlError, errorMessage });
    }

    // Log all URL parameters for debugging
    console.log("URL parameters:", Object.fromEntries(searchParams.entries()));
    
    // Set session from URL parameters when component mounts
    const setSessionFromUrl = async () => {
      try {
        // Check for both token param and hash fragment
        const token = searchParams.get("token") || new URLSearchParams(window.location.hash.substring(1)).get("token");
        const type = searchParams.get("type") || new URLSearchParams(window.location.hash.substring(1)).get("type");
        
        console.log("Recovery params:", { token: !!token, type });
        
        // For password recovery links
        if (token && type === "recovery") {
          console.log("Received recovery token, marking as valid");
          setHasValidToken(true);
          
          // Clear any URL error since we have a valid token
          if (urlError) {
            setError(null);
          }
          
          return true;
        }
        
        return false;
      } catch (err) {
        console.error("Error parsing URL params:", err);
        return false;
      }
    };
    
    setSessionFromUrl().then(validSession => {
      if (!validSession && !urlError) {
        console.log("No valid session found and no URL error");
        setError("Invalid or expired password reset link. Please request a new one.");
      }
    });
  }, [searchParams]);

  const handleSetPassword = async (values: PasswordFormValues) => {
    setIsSettingPassword(true);
    setError(null);
    
    try {
      console.log("Setting new password");
      
      // Check for token in URL params or hash fragment
      const token = searchParams.get("token") || new URLSearchParams(window.location.hash.substring(1)).get("token");
      const type = searchParams.get("type") || new URLSearchParams(window.location.hash.substring(1)).get("type");
      
      if (!token || type !== "recovery") {
        throw new Error("Invalid password reset link. Please request a new one.");
      }
      
      // Update password using the token
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Password updated successfully");
      setIsSuccess(true);
      toast({
        title: "Password set successfully",
        description: "You can now log in with your new password.",
      });
    } catch (err: any) {
      console.error("Error setting password:", err);
      setError(err.message || "Failed to set password. Please try again.");
      toast({
        title: "Error",
        description: err.message || "Failed to set password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSettingPassword(false);
    }
  };

  // Function to go to forgot password page
  const handleRequestNewLink = () => {
    navigate("/forgot-password");
  };

  return (
    <MainLayout>
      <div className="flex min-h-[70vh] py-12">
        <div className="m-auto w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Set New Password</h1>
            <p className="text-gray-600 mt-2">
              Please create a secure password for your account.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <div className="mt-2">
                <Button size="sm" variant="outline" onClick={handleRequestNewLink}>
                  Request New Link
                </Button>
              </div>
            </Alert>
          )}

          {isSuccess ? (
            <PasswordSuccessMessage />
          ) : hasValidToken ? (
            <PasswordForm
              onSubmit={handleSetPassword}
              isLoading={isSettingPassword}
            />
          ) : (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="mb-3">
                  Invalid or expired password reset link. Please request a new one.
                </div>
                <Button size="sm" onClick={handleRequestNewLink}>
                  Request New Password Reset
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SetPasswordPage;
