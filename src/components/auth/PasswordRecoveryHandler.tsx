
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";

interface PasswordRecoveryHandlerProps {
  userEmail: string;
}

const PasswordRecoveryHandler: React.FC<PasswordRecoveryHandlerProps> = ({ userEmail }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSendPasswordSetupEmail = async () => {
    setIsSubmitting(true);
    
    try {
      // Use password recovery method for simplicity, since it doesn't require session
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/set-password`,
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Password Setup Email Sent",
        description: `We've sent a password setup link to ${userEmail}. Please check your inbox.`,
      });
    } catch (error: any) {
      console.error("Error sending password setup email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password setup email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-800">
          We've sent a password setup link to <strong>{userEmail}</strong>. 
          Please check your inbox and follow the instructions to set your password.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          To activate your account, we'll send you a password setup link to <strong>{userEmail}</strong>.
        </AlertDescription>
      </Alert>
      
      <Button 
        onClick={handleSendPasswordSetupEmail}
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending email...
          </>
        ) : (
          "Send Password Setup Link"
        )}
      </Button>
    </div>
  );
};

export default PasswordRecoveryHandler;
