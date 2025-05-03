
/**
 * Hook for sending invoice emails
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

  return { sendInvoiceEmail };
};

export default useInvoiceEmail;
