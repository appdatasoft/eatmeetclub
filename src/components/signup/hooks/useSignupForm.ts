
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
      
      // Store basic user info in localStorage for persistence
      localStorage.setItem('signup_email', values.email);
      localStorage.setItem('signup_name', `${values.firstName} ${values.lastName}`);
      if (values.phoneNumber) {
        localStorage.setItem('signup_phone', values.phoneNumber);
      }

      // Register the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phoneNumber || null,
            address: values.address || null,
            full_name: `${values.firstName} ${values.lastName}`
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`,
        },
      });

      if (error) throw error;
      
      // Send our welcome email with activation link
      await sendWelcomeEmail(
        values.email, 
        `${values.firstName} ${values.lastName}` || values.email.split('@')[0]
      );
      
      // Send notification about registration
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
        showToast({
          title: "Registration successful!",
          description: "We've sent you an email with an activation link. Please check your inbox.",
        });
      }

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
