
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface PasswordRecoveryHandlerProps {
  userEmail: string;
}

const PasswordRecoveryHandler = ({ userEmail }: PasswordRecoveryHandlerProps) => {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const handleSendRecoveryEmail = async () => {
    try {
      // Get the current origin (domain) for the redirect URL
      const currentOrigin = window.location.origin;
      
      // Send a password reset email with dynamic redirect URL
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${currentOrigin}/set-password`,
      });

      if (error) {
        throw error;
      }

      setSent(true);
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for a link to set your password."
      });
    } catch (error: any) {
      console.error("Failed to send password reset email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600">
          A password reset link has been sent to {userEmail}. 
          Please check your email to complete the process.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-4">
      <p className="text-sm text-gray-600 mb-4">
        To set your password, we need to send you a password reset link.
      </p>
      <Button onClick={handleSendRecoveryEmail}>
        Send Reset Link
      </Button>
    </div>
  );
};

export default PasswordRecoveryHandler;
