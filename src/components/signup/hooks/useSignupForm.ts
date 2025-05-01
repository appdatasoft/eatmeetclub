
import { supabase } from "@/integrations/supabase/client";
import { toast as showToast } from "@/hooks/use-toast";
import { SignupFormValues } from "../SignupForm";

interface UseSignupFormProps {
  setIsLoading: (loading: boolean) => void;
  setUserDetails: (details: SignupFormValues | null) => void;
  setShowPaymentForm: (show: boolean) => void;
  setIsNotificationSent: (sent: boolean) => void;
}

export const useSignupForm = ({
  setIsLoading,
  setUserDetails,
  setShowPaymentForm,
  setIsNotificationSent
}: UseSignupFormProps) => {

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      // Store the user details for later use in payment verification
      localStorage.setItem('signup_email', values.email);
      localStorage.setItem('signup_name', values.email.split('@')[0]); // Using part of email as name since we don't collect full name
      if (values.phoneNumber) {
        localStorage.setItem('signup_phone', values.phoneNumber);
      }

      // Register the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            phone: values.phoneNumber || null,
          },
        },
      });

      if (error) throw error;
      
      // Verify that we have a session before proceeding
      if (!data.session) {
        console.log("No session returned from signup, attempting to sign in");
        // Try to sign in to get a session
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        
        if (signInError) {
          console.error("Error signing in after signup:", signInError);
          throw new Error("Account created but could not sign in automatically. Please try logging in separately.");
        }
      }

      // Send notification via the edge function
      const notificationResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-member-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: values.email,
            name: values.email.split('@')[0], // Just using part of email as name
            phone: values.phoneNumber,
          }),
        }
      );

      if (notificationResponse.ok) {
        setIsNotificationSent(true);
        showToast({
          title: "Confirmation sent!",
          description: "We've sent you an email and text confirmation.",
        });
      }

      showToast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });

      // Proceed to payment form
      setUserDetails(values);
      setShowPaymentForm(true);
    } catch (error: any) {
      console.error("Signup error:", error);
      showToast({
        title: "Registration failed",
        description: error.message || "There was a problem creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { handleSignupSubmit };
};
