
import { supabase } from "@/integrations/supabase/client";
import { toast as showToast } from "@/hooks/use-toast";
import { SignupFormValues } from "../SignupForm";
import { useWelcomeEmail } from "@/hooks/membership";

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
  // Initialize the welcome email hook
  const { sendWelcomeEmail } = useWelcomeEmail();

  const handleSignupSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);

    try {
      // Check if the user is already logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        console.log("User is already logged in, proceeding to payment");
        // Store minimal details
        values.email = session.user.email || values.email;
        
        // Skip registration step and go directly to payment
        setUserDetails(values);
        setShowPaymentForm(true);
        setIsLoading(false);
        return;
      }
      
      // For new users, continue with signup process
      localStorage.setItem('signup_email', values.email);
      localStorage.setItem('signup_name', values.email.split('@')[0]); // Using part of email as name
      if (values.phoneNumber) {
        localStorage.setItem('signup_phone', values.phoneNumber);
      }

      // Register the user in Supabase Auth without email confirmation
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            phone: values.phoneNumber || null,
          },
          emailRedirectTo: `${window.location.origin}/set-password`, // Redirect to set password page
        },
      });

      if (error) throw error;
      
      // Send our custom welcome email instead of using Supabase's default
      await sendWelcomeEmail(values.email, values.email.split('@')[0] || "Member");
      
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
          description: "We've sent you an email with account activation instructions.",
        });
      }

      showToast({
        title: "Registration successful",
        description: "Your account has been created. Check your email to activate it.",
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
