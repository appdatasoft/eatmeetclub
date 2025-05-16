
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import { PasswordForm, PasswordFormValues, PasswordSuccessMessage } from "@/components/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  // Track if we have a valid token
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    // Set session from URL parameters when component mounts
    const setSessionFromUrl = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");
      
      console.log("URL parameters:", { 
        hasToken: !!token,
        type
      });
      
      // For password recovery links
      if (token && type === "recovery") {
        console.log("Received recovery token, marking as valid");
        setHasValidToken(true);
        return true;
      }
      
      return false;
    };
    
    setSessionFromUrl().then(validSession => {
      if (!validSession) {
        setError("Invalid or expired password reset link. Please request a new one.");
      }
    });
  }, [searchParams]);

  const handleSetPassword = async (values: PasswordFormValues) => {
    setIsSettingPassword(true);
    setError(null);
    
    try {
      console.log("Updating password");
      
      const token = searchParams.get("token");
      const type = searchParams.get("type");
      
      if (!token || type !== "recovery") {
        throw new Error("Invalid password reset link. Please request a new one.");
      }
      
      // For password recovery flow using the recovery token
      const { error } = await supabase.auth.resetPasswordForEmail(
        "", // Email is not required when using a token
        {
          token: token,
          password: values.password
        }
      );
      
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
                Invalid or expired password reset link. Please request a new one.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SetPasswordPage;
