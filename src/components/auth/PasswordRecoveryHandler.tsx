
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: userEmail || "",
    },
  });

  const handleSendPasswordResetEmail = async (formData: { email: string }) => {
    setIsSubmitting(true);
    setErrorMessage(null);
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
      // Get current origin for proper redirect
      const currentOrigin = window.location.origin;
      console.log(`[${new Date().toISOString()}] Current origin: ${currentOrigin}`);
      const redirectTo = `${currentOrigin}/set-password`;
      console.log(`[${new Date().toISOString()}] Sending password reset email to: ${email}`);
      console.log(`[${new Date().toISOString()}] Redirect URL: ${redirectTo}`);

      // Use Supabase's built-in password reset functionality with proper redirectTo
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

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

        <div className="text-center mt-4">
          <Button variant="outline" onClick={() => setIsSuccess(false)} className="mr-2">
            Try Again with Different Email
          </Button>
          <Button onClick={() => window.location.href = "/login"}>
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
        <form onSubmit={form.handleSubmit(handleSendPasswordResetEmail)} className="space-y-4">
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

          <Button type="submit" disabled={isSubmitting} className="w-full">
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
        <p>If you don't receive the email within a few minutes:</p>
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
