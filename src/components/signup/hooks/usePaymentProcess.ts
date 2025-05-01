
import { toast as showToast } from "@/hooks/use-toast";

interface UsePaymentProcessProps {
  setIsLoading: (loading: boolean) => void;
}

export const usePaymentProcess = ({ setIsLoading }: UsePaymentProcessProps) => {
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedEmail = localStorage.getItem('signup_email');
    const storedName = localStorage.getItem('signup_name');
    const storedPhone = localStorage.getItem('signup_phone');
    
    if (!storedEmail) return;
    
    setIsLoading(true);

    try {
      console.log("Initiating payment process with user details:", storedEmail);
      
      // Create a Stripe checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: storedEmail,
            name: storedName || storedEmail.split('@')[0], // Using stored name or part of email
            phone: storedPhone,
          }),
        }
      );
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        let errorMessage = "Failed to create checkout session";
        try {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.success && data.url) {
        // Redirect to the Stripe checkout page
        console.log("Redirecting to:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Failed to create checkout session");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      showToast({
        title: "Error",
        description: error.message || "There was a problem initiating the checkout process",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return { handlePayment };
};
