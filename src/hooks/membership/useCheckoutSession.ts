
/**
 * Hook for creating checkout sessions
 */
export const useCheckoutSession = () => {
  /**
   * Creates a checkout session with Stripe
   */
  const createCheckoutSession = async (
    email: string, 
    name: string, 
    phone: string | null = null, 
    address: string | null = null,
    options = {
      createUser: true,
      sendPasswordEmail: true,
      sendInvoiceEmail: true
    }
  ) => {
    try {
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
            redirectToCheckout: true,
            // Add metadata to help with user creation and emails
            createUser: options.createUser,
            sendPasswordEmail: options.sendPasswordEmail,
            sendInvoiceEmail: options.sendInvoiceEmail,
            // Added force flags to ensure database records are created
            forceCreateUser: options.createUser,
            createMembershipRecord: true,
            // Add timestamp to prevent caching
            timestamp: new Date().getTime()
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }
      
      return await response.json();
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      throw error;
    }
  };

  return {
    createCheckoutSession
  };
};

export default useCheckoutSession;
