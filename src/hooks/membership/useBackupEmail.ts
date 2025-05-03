
/**
 * Hook for sending backup emails when primary email methods fail
 */
export const useBackupEmail = () => {
  /**
   * Send a direct backup email through the custom email function
   */
  const sendDirectBackupEmail = async (email: string, name: string, paymentId: string) => {
    try {
      console.log("Sending backup welcome email");
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-custom-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          },
          body: JSON.stringify({
            to: [email],
            subject: "Important: Your Eat Meet Club Membership",
            html: `
              <h1>Your Eat Meet Club Membership</h1>
              <p>Hello ${name},</p>
              <p>Thank you for joining! Your payment (ID: ${paymentId}) has been received successfully.</p>
              <p>We're completing your membership setup. If you don't receive login instructions within 15 minutes, please contact us at support@eatmeetclub.com with your payment ID.</p>
              <p>Best regards,<br>The Eat Meet Club Team</p>
            `,
            emailType: "last_resort_backup",
            preventDuplicate: false,
            fromName: "Eat Meet Club Support"
          }),
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error("Error sending direct backup email:", error);
      return false;
    }
  };

  return { sendDirectBackupEmail };
};

export default useBackupEmail;
