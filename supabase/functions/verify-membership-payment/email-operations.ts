
/**
 * Functions for sending emails
 */
export const emailOperations = {
  /**
   * Send invoice email
   */
  sendInvoiceEmail: async (sessionId: string, email: string, name: string, options = {
    preventDuplicates: true,
    forceSend: false
  }) => {
    try {
      console.log("Sending invoice email");
      // Send invoice email
      const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://eatmeetclub.lovable.app";
      const emailResponse = await fetch(`${frontendUrl}/functions/v1/send-invoice-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          email,
          name: name || "Member",
          preventDuplicates: options.preventDuplicates !== false && options.forceSend !== true,
        }),
      });
      
      if (emailResponse.ok) {
        console.log("Invoice email sent successfully");
        return true;
      } else {
        console.error("Failed to send invoice email:", await emailResponse.text());
        return false;
      }
    } catch (emailError) {
      console.error("Error sending invoice email:", emailError);
      return false;
    }
  }
};
