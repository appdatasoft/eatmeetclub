
import { useInvoiceEmail } from "./useInvoiceEmail";

/**
 * Hook for handling welcome email functionality
 */
export const useWelcomeEmail = () => {
  const { getInvoiceReceiptUrl } = useInvoiceEmail();
  
  /**
   * Sends a welcome email to the user with a password setup link that also activates their account
   */
  const sendWelcomeEmail = async (email: string, name: string, sessionId?: string) => {
    try {
      // Get the current origin for generating correct URLs
      const currentOrigin = window.location.origin;
      
      // If session ID is provided, try to get the receipt URL
      let receiptUrl = "";
      if (sessionId) {
        try {
          const url = await getInvoiceReceiptUrl(sessionId);
          if (url) {
            receiptUrl = `<p>You can view your invoice receipt <a href="${url}" style="color: #4a5568; font-weight: bold;" target="_blank">here</a>.</p>`;
          }
        } catch (receiptError) {
          console.error("Failed to get receipt URL:", receiptError);
          // Continue without the receipt URL
        }
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-custom-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: [email],
            subject: "Welcome to Eat Meet Club - Activate Your Account",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a5568;">Welcome to Eat Meet Club, ${name}!</h2>
                <p>Thank you for becoming a member of our community! We're excited to have you join us.</p>
                
                <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 25px 0;">
                  <h3 style="margin-top: 0; color: #4a5568;">One-Step Account Activation</h3>
                  <p>We've created an account for you using your email address. To activate your account and set your password, please click the button below:</p>
                
                  <div style="margin: 30px 0; text-align: center;">
                    <a href="${currentOrigin}/set-password?email=${encodeURIComponent(email)}" 
                       style="background-color: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                       Activate Account
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #718096;">If the button doesn't work, you can copy and paste this URL into your browser:</p>
                  <p style="word-break: break-all; font-size: 14px; background-color: #edf2f7; padding: 10px; border-radius: 4px;">${currentOrigin}/set-password?email=${encodeURIComponent(email)}</p>
                </div>
                
                ${receiptUrl}
                
                <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                  <p>Looking forward to seeing you at our upcoming dining experiences!</p>
                  <p>Best regards,<br>The Eat Meet Club Team</p>
                </div>
              </div>
            `,
            fromName: "Eat Meet Club",
            emailType: "welcome",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error sending welcome email");
      }

      return true;
    } catch (error: any) {
      console.error("Error sending welcome email:", error);
      return false;
    }
  };

  return {
    sendWelcomeEmail
  };
};

export default useWelcomeEmail;
