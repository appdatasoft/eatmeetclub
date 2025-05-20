
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface PasswordRecoveryHandlerProps {
  userEmail: string;
}

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const PasswordRecoveryHandler: React.FC<PasswordRecoveryHandlerProps> = ({ userEmail }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: userEmail || "",
    },
  });

  const handleSendPasswordSetupEmail = async (formData: { email: string }) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setDebugInfo(null);
    const email = formData.email || userEmail;
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log("Sending password reset email to:", email);
      
      // Make sure the redirect URL includes the /set-password path
      const redirectUrl = `${window.location.origin}/set-password`;
      console.log("Reset email redirect URL:", redirectUrl);
      
      // Use password recovery method for simplicity, since it doesn't require session
      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      // Log detailed response from Supabase
      console.log("Reset password response:", { 
        error, 
        data,
        timestamp: new Date().toISOString(),
        hostEnvironment: window.location.hostname,
        browserInfo: navigator.userAgent
      });
      
      // Store debug info that can be displayed in the UI
      setDebugInfo({
        timestamp: new Date().toISOString(),
        resetRequestSent: !error,
        redirectUrl: redirectUrl
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Reset Link Sent",
        description: `We've sent a password reset link to ${email}. Please check your inbox (and spam folder).`,
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      setErrorMessage(error.message || "Failed to send reset email. Please try again later.");
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-800">
            We've sent a password reset link to <strong>{userEmail || form.getValues().email}</strong>. 
            Please check your inbox (and spam/junk folder). If you don't see it within a few minutes, please try again.
          </AlertDescription>
        </Alert>
        
        {debugInfo && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs font-mono">
              <div className="font-semibold mb-1">Debug information:</div>
              <div>Timestamp: {debugInfo.timestamp}</div>
              <div>Reset request sent: {debugInfo.resetRequestSent ? "Yes" : "No"}</div>
              <div>Redirect URL: {debugInfo.redirectUrl}</div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsSuccess(false)}
            className="mr-2"
          >
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.href = "/login"}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          {userEmail 
            ? `To activate your account or reset your password, we'll send you a setup link to ${userEmail}.`
            : "Enter your email address to receive a password reset link."}
        </AlertDescription>
      </Alert>
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSendPasswordSetupEmail)} className="space-y-4">
          {!userEmail && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending email...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="text-xs text-gray-500 mt-4">
        <p>
          If you don't receive the email within a few minutes:
        </p>
        <ul className="list-disc pl-5 mt-2">
          <li>Check your spam or junk folder</li>
          <li>Verify that you entered the correct email address</li>
          <li>Check if your email provider is blocking emails from Supabase</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordRecoveryHandler;
