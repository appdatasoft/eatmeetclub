import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";
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
      
      // Get the current domain with protocol
      const domain = window.location.origin;
      
      // Always construct the redirect URL using the current domain
      // Make sure it's a complete URL with protocol and host
      const redirectUrl = new URL("/set-password", domain).toString();
      
      console.log("Reset email redirect URL:", redirectUrl);
      
      // First try the edge function approach for better control
      try {
        // Ensure we're using the correct API path
        const edgeFunctionUrl = `${domain}/api/generate-magic-link`;
        console.log("Calling edge function at:", edgeFunctionUrl);
        
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectUrl }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error("Edge function error:", result);
          throw new Error(result.message || "Failed to generate magic link");
        }
        
        console.log("Magic link generated via edge function:", result);
        
        // Store debug info
        setDebugInfo({
          timestamp: new Date().toISOString(),
          resetRequestSent: true,
          email: email,
          redirectUrl: redirectUrl,
          actualRedirectUsed: result.redirectUrl || "Not returned",
          method: "edge-function"
        });
        
        setIsSuccess(true);
        toast({
          title: "Reset Link Sent",
          description: `We've sent a password reset link to ${email}. Please check your inbox (and spam folder).`,
        });
        
        return;
      } catch (edgeError) {
        console.error("Edge function failed, details:", edgeError);
        console.warn("Falling back to default Supabase method");
        // Continue to fallback method
      }
      
      // Fallback: Use the default Supabase auth resetPasswordForEmail
      console.log("Using Supabase fallback method with redirect:", redirectUrl);
      
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
        email: email,
        redirectUrl: redirectUrl,
        method: "supabase-client"
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
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-800">
            <p className="font-medium">Reset link sent!</p>
            <p>We've sent a password reset link to <strong>{userEmail || form.getValues().email}</strong>.</p>
            <p className="mt-2">Please check your inbox and spam/junk folders. The email should arrive within a few minutes.</p>
          </AlertDescription>
        </Alert>
        
        {debugInfo && (
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs font-mono">
              <div className="font-semibold mb-1">Debug information:</div>
              <div>Timestamp: {debugInfo.timestamp}</div>
              <div>Email: {debugInfo.email}</div>
              <div>Reset request sent: {debugInfo.resetRequestSent ? "Yes" : "No"}</div>
              <div>Redirect URL: {debugInfo.redirectUrl}</div>
              {debugInfo.actualRedirectUsed && (
                <div>Actual redirect used: {debugInfo.actualRedirectUsed}</div>
              )}
              <div>Method: {debugInfo.method}</div>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsSuccess(false)}
            className="mr-2"
          >
            Try Again with Different Email
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
            ? `To reset your password, we'll send a setup link to ${userEmail}.`
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
                      autoComplete="email"
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
          <li>Check if your email provider is blocking emails from our verification system</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordRecoveryHandler;
