
/**
 * Hook for sending invoice emails and retrieving invoice links
 */
export const useInvoiceEmail = () => {
  /**
   * Send invoice email directly as fallback
   */
  const sendInvoiceEmail = async (sessionId: string, email: string, name: string) => {
    try {
      console.log("Sending direct invoice email for", email, "session", sessionId);
      const timestamp = new Date().getTime(); // Add timestamp to bypass caching
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-invoice-email?t=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          body: JSON.stringify({
            sessionId,
            email,
            name,
            preventDuplicate: false // Force send even if duplicate
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Invoice email sending failed: ${errorText}`);
      }
      
      console.log("Direct invoice email sent successfully");
      return true;
    } catch (error) {
      console.error("Error sending direct invoice email:", error);
      return false;
    }
  };
  
  /**
   * Get the invoice receipt URL for a given session ID
   * @param sessionId Stripe session ID
   * @returns Receipt URL or null if not found
   */
  const getInvoiceReceiptUrl = async (sessionId: string) => {
    try {
      console.log("Getting invoice receipt URL for session", sessionId);
      const timestamp = new Date().getTime();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/get-invoice-receipt?t=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          body: JSON.stringify({
            sessionId
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get invoice receipt: ${errorText}`);
      }
      
      const data = await response.json();
      return data.receiptUrl || null;
      
    } catch (error) {
      console.error("Error getting invoice receipt URL:", error);
      return null;
    }
  };

  /**
   * Check if a user already has an active membership
   * @param email User's email address
   * @returns Membership status object or null if no membership found
   */
  const checkActiveMembership = async (email: string) => {
    try {
      console.log("Checking active membership for email:", email);
      const timestamp = new Date().getTime();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/check-membership-status?t=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          body: JSON.stringify({
            email
          }),
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to check membership status: ${errorText}`);
      }
      
      const data = await response.json();
      return data.membership || null;
      
    } catch (error) {
      console.error("Error checking membership status:", error);
      return null;
    }
  };

  return { sendInvoiceEmail, getInvoiceReceiptUrl, checkActiveMembership };
};

export default useInvoiceEmail;
