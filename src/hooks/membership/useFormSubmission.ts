
export interface FormSubmissionProps {
  setIsProcessing: (value: boolean) => void;
  setNetworkError: (value: string | null) => void;
  setClientSecret: (value: string | null) => void;
  setPaymentIntentId: (value: string | null) => void;
}

export const useFormSubmission = ({
  setIsProcessing,
  setNetworkError,
  setClientSecret,
  setPaymentIntentId
}: FormSubmissionProps) => {
  const handleSubmit = async (values: any) => {
    setIsProcessing(true);
    setNetworkError(null);
    
    try {
      // Get user details from localStorage or use the form values
      const email = values.email;
      const name = values.name;
      const phone = values.phone || null;
      const address = values.address || null;
      
      console.log("Submitting membership form with details:", { email, name });
      
      // Create a checkout session or payment intent based on the form values
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            name,
            phone,
            address,
            redirectToCheckout: false,
            createUser: true,
            sendPasswordEmail: true,
            sendInvoiceEmail: true,
            forceCreateUser: true,
            createMembershipRecord: true
          }),
        }
      );
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create payment intent");
      }
      
      const data = await response.json();
      console.log("Payment form submission response:", data);
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        
        // Store the details in localStorage for verification later
        localStorage.setItem('signup_email', email);
        localStorage.setItem('signup_name', name);
        if (phone) localStorage.setItem('signup_phone', phone);
        if (address) localStorage.setItem('signup_address', address);
      } else {
        throw new Error("No client secret returned");
      }
    } catch (error: any) {
      console.error("Error starting payment process:", error);
      setNetworkError(error.message || "There was a problem starting the payment process");
    } finally {
      setIsProcessing(false);
    }
  };

  return { handleSubmit };
};

export default useFormSubmission;
