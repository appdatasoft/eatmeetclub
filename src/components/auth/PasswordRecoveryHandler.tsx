
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
      console.log(`[${new Date().toISOString()}] Sending password reset email to:`, email);
      
      // IMPORTANT: Ensure we use the full origin INCLUDING protocol
      const domain = window.location.origin;
      console.log(`[${new Date().toISOString()}] Current domain/origin:`, domain);
      
      // Call the edge function via our API route
      try {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Calling edge function for password reset`);
        
        // Always use the full URL to the edge function through our API route
        const edgeFunctionUrl = `${domain}/api/generate-magic-link`;
        console.log(`[${timestamp}] Edge function URL:`, edgeFunctionUrl);
        
        const response = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email, 
            redirectUrl: domain, // Just provide the domain, the edge function will add /set-password
            timestamp
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[${timestamp}] Edge function error response:`, errorText);
          throw new Error(`Edge function failed with status ${response.status}`);
        }
        
        const result = await response.json();
        
        console.log(`[${timestamp}] Magic link generation result:`, result);
        
        if (!result.success) {
          throw new Error(result.message || "Failed to generate magic link");
        }
        
        // Store detailed debug info
        setDebugInfo({
          timestamp,
          resetRequestSent: true,
          email,
          domain,
          actualRedirectUsed: result.redirectUrl || "Not returned",
          originalRedirectUrl: result.originalRedirectUrl,
          method: "edge-function",
          responseData: result
        });
        
        setIsSuccess(true);
        toast({
          title: "Reset Link Sent",
          description: `We've sent a password reset link to ${email}. Please check your inbox (and spam folder).`,
        });
        
        return;
      } catch (edgeError) {
        console.error(`[${new Date().toISOString()}] Edge function failed:`, edgeError);
        console.warn(`[${new Date().toISOString()}] Falling back to default Supabase method`);
        
        // Store debug info about the edge function failure
        setDebugInfo({
          timestamp: new Date().toISOString(),
          edgeFunctionError: edgeError.message,
          fallbackToSupabaseDirect: true
        });
        
        // Don't throw here - continue to fallback method
      }
      
      // Fallback: Use the default Supabase auth resetPasswordForEmail
      // Explicitly construct the redirect URL with /set-password path
      const redirectUrl = `${domain}/set-password`;
      console.log(`[${new Date().toISOString()}] Using Supabase fallback method with redirect:`, redirectUrl);
      
      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      // Log detailed response
      console.log(`[${new Date().toISOString()}] Reset password response:`, { 
        error, 
        data,
        redirectUrl,
        domain,
        hostEnvironment: window.location.hostname
      });
      
      // Update debug info with fallback method details
      setDebugInfo(prevInfo => ({
        ...prevInfo || {},
        timestamp: new Date().toISOString(),
        resetRequestSent: !error,
        email,
        redirectUrl,
        method: "supabase-client-fallback"
      }));
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Reset Link Sent",
        description: `We've sent a password reset link to ${email}. Please check your inbox (and spam folder).`,
      });
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
