
/**
 * Handles invoice email functionality and membership status checking
 */
export const useInvoiceEmail = () => {
  /**
   * Check if a user has an active membership by email
   */
  const checkActiveMembership = async (email: string): Promise<{
    active: boolean;
    remainingDays: number;
    proratedAmount: number;
  } | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-membership-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
          },
          body: JSON.stringify({ email })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to check membership status");
      }

      const data = await response.json();
      
      // If no membership data is found or response indicates no membership
      if (data.error || !data.hasOwnProperty('active')) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("checkActiveMembership error:", error);
      return null;
    }
  };

  /**
   * Send invoice email for membership payments
   */
  const sendInvoiceEmail = async (paymentId: string, email: string, name: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invoice-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentId,
            email,
            name,
            type: "membership"
          })
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to send invoice email");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Send invoice email error:", error);
      return { success: false };
    }
  };

  /**
   * Get invoice receipt URL for a payment
   */
  const getInvoiceReceiptUrl = async (sessionId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-invoice-receipt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ sessionId })
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to get invoice receipt URL");
      }
      
      const data = await response.json();
      return data.receiptUrl;
    } catch (error) {
      console.error("Get invoice receipt URL error:", error);
      return null;
    }
  };

  return {
    checkActiveMembership,
    sendInvoiceEmail,
    getInvoiceReceiptUrl
  };
};

// Export as default as well for backward compatibility
export default useInvoiceEmail;
