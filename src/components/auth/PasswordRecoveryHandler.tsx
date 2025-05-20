
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
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Sending password reset email to: ${email}`);
      
      // IMPORTANT: Ensure the redirect path is ALWAYS set to /set-password
      // Get the full origin as base URL
      const domain = window.location.origin;
      console.log(`[${timestamp}] Current domain/origin: ${domain}`);
      
      // Explicitly construct the full redirect URL with /set-password path
      const redirectUrl = `${domain}/set-password`;
      console.log(`[${timestamp}] Constructed redirect URL: ${redirectUrl}`);

      // CRITICAL: Force redirectUrl to have /set-password and NOT use www.eatmeetclub.com
      // Try direct Supabase API method with explicit redirect configuration
      try {
        console.log(`[${timestamp}] Using direct Supabase auth.resetPasswordForEmail with explicit redirect`);
        
        const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        
        // Log detailed response
        console.log(`[${timestamp}] Reset password response:`, { 
          error, 
          data,
          redirectUrl,
          emailSent: !error,
        });
        
        // Store debug info
        setDebugInfo({
          timestamp,
          resetRequestSent: !error,
          email,
          domain,
          redirectUrl,
          method: "supabase-auth-direct-with-explicit-redirect"
        });
        
        if (error) {
          console.warn(`[${timestamp}] Direct Supabase method failed:`, error);
          throw error;
        } else {
          // Direct method worked, set success and return
          setIsSuccess(true);
          toast({
            title: "Reset Link Sent",
            description: `We've sent a password reset link to ${email}. Please check your inbox (and spam folder).`,
          });
          setIsSubmitting(false);
          return;
        }
      } catch (directError) {
        console.warn(`[${timestamp}] Error with direct Supabase method:`, directError);
        throw directError;
      }
      
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Error sending password reset email:`, error);
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
              {debugInfo.domain && <div>Domain: {debugInfo.domain}</div>}
              {debugInfo.redirectUrl && <div>Redirect URL: {debugInfo.redirectUrl}</div>}
              {debugInfo.actualRedirectUsed && (
                <div>Actual redirect used: {debugInfo.actualRedirectUsed}</div>
              )}
              {debugInfo.originalRedirectUrl && (
                <div>Original redirect URL: {debugInfo.originalRedirectUrl}</div>
              )}
              {debugInfo.edgeFunctionError && (
                <div>Edge function error: {debugInfo.edgeFunctionError}</div>
              )}
              {debugInfo.fallbackToSupabaseDirect && (
                <div>Fallback to Supabase direct: Yes</div>
              )}
              <div>Method: {debugInfo.method}</div>
              {debugInfo.responseData && (
                <div>
                  <div className="mt-1">Response data:</div>
                  <pre className="text-[0.65rem] mt-1 bg-gray-100 p-1 rounded overflow-auto max-h-32">
                    {JSON.stringify(debugInfo.responseData, null, 2)}
                  </pre>
                </div>
              )}
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
