
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
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
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: userEmail || "",
    },
  });

  const handleSendPasswordSetupEmail = async (formData: { email: string }) => {
    setIsSubmitting(true);
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
      // Use password recovery method for simplicity, since it doesn't require session
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/set-password`,
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Reset Link Sent",
        description: `We've sent a password reset link to ${email}. Please check your inbox.`,
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
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
      <Alert className="bg-green-50 border-green-200">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-800">
          We've sent a password reset link to <strong>{userEmail || form.getValues().email}</strong>. 
          Please check your inbox and follow the instructions to set your password.
        </AlertDescription>
      </Alert>
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
    </div>
  );
};

export default PasswordRecoveryHandler;
