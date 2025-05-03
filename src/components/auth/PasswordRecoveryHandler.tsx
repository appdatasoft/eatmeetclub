
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordRecoveryHandlerProps {
  userEmail: string;
}

const PasswordRecoveryHandler = ({ userEmail }: PasswordRecoveryHandlerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Automatically send password reset email when component mounts
  useEffect(() => {
    handleSendPasswordReset();
  }, [userEmail]);

  const handleSendPasswordReset = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Initiating password reset for account activation: ${userEmail}`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/set-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      toast({
        title: "Activation link sent",
        description: "Check your email for an account activation link.",
      });
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      setError(error.message || "Failed to send activation link. Please try again.");
      toast({
        title: "Error",
        description: error.message || "Failed to send activation link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success ? (
        <div className="p-4 bg-green-50 border border-green-100 rounded-md flex flex-col items-center text-center">
          <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
          <h3 className="font-medium">Activation email sent!</h3>
          <p className="text-sm text-gray-600 mt-1">
            We've sent an account activation link to <strong>{userEmail}</strong>.
            Please check your inbox and click the link to set your password.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            To activate your account and set your password, click the button below to receive an activation link at <strong>{userEmail}</strong>.
          </p>
          
          <Button 
            onClick={handleSendPasswordReset} 
            disabled={isLoading} 
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Activation Link"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PasswordRecoveryHandler;
