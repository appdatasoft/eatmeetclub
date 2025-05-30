
import { toast as showToast } from "@/hooks/use-toast";

interface UsePaymentProcessProps {
  setIsLoading: (loading: boolean) => void;
}

export const usePaymentProcess = ({ setIsLoading }: UsePaymentProcessProps) => {
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data from the hidden fields
    const form = e.target as HTMLFormElement;
    const firstName = (form.querySelector('#firstName') as HTMLInputElement)?.value;
    const lastName = (form.querySelector('#lastName') as HTMLInputElement)?.value;
    const email = (form.querySelector('#email') as HTMLInputElement)?.value;
    const phone = (form.querySelector('#phone') as HTMLInputElement)?.value;
    const address = (form.querySelector('#address') as HTMLInputElement)?.value;
    
    if (!email) {
      showToast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }
    
    // Store user details in localStorage for later use
    localStorage.setItem('signup_email', email);
    localStorage.setItem('signup_name', `${firstName} ${lastName}`.trim());
    localStorage.setItem('signup_phone', phone || '');
    localStorage.setItem('signup_address', address || '');
    
    setIsLoading(true);
    
    try {
      console.log("Creating checkout session with details:", { email, firstName, lastName, phone, address });
      
      // Create a Stripe checkout session - without requiring auth
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name: `${firstName} ${lastName}`.trim(),
            phone,
            address
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
