
import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { SignupFormValues } from "@/components/signup/SignupForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseSignupActionsProps {
  navigate: NavigateFunction;
}

export const useSignupActions = ({ navigate }: UseSignupActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isNotificationSent, setIsNotificationSent] = useState(false);
  const { toast } = useToast();

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      // Store user metadata
      const metadata = {
        full_name: `${values.firstName} ${values.lastName}`,
        first_name: values.firstName,
        last_name: values.lastName,
        phone: values.phoneNumber,
        address: values.address
      };

      // Register the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (error) throw error;
      
      // Send notification via the edge function for SMS verification
      try {
        const notificationResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-member-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: values.email,
              name: `${values.firstName} ${values.lastName}`,
              phone: values.phoneNumber,
            }),
          }
        );

        if (notificationResponse.ok) {
          setIsNotificationSent(true);
        }
      } catch (notifyError) {
        console.error("Error sending notifications:", notifyError);
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });

      // Redirect to login page
      navigate("/login?signup=success");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    isLoading, 
    isVerifying, 
    isVerified, 
    isNotificationSent,
    handleSignupSubmit,
    setIsLoading,
    setIsNotificationSent
  };
};

export default useSignupActions;
