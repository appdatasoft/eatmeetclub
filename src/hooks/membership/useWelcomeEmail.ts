
import { supabase } from "@/integrations/supabase/client";
import { useInvoiceEmail } from "./useInvoiceEmail";

/**
 * Hook for handling welcome email functionality
 */
export const useWelcomeEmail = () => {
  const { getInvoiceReceiptUrl } = useInvoiceEmail();
  
  /**
   * Sends a combined welcome and activation email to the user
   */
  const sendWelcomeEmail = async (email: string, name: string, sessionId?: string) => {
    try {
      // Get the current origin for generating correct URLs
      // Never use localhost in production emails - use the actual domain
      const currentOrigin = window.location.origin.includes('localhost') 
        ? "https://eatmeetclub.lovable.app" 
        : window.location.origin;
      
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
      
      // Create a direct activation link that goes to set password page with email prefilled
      const activationLink = `${currentOrigin}/set-password?email=${encodeURIComponent(email)}`;
      
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
                
                <p>We're excited to have you as a member of our community.</p>
                
                <p>To activate your account and set your password, please click the button below:</p>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${activationLink}" 
                     style="padding: 12px 24px; background: #ff5b2e; color: white; border-radius: 5px; display: inline-block; text-decoration: none; font-weight: bold;">
                     Activate Account & Set Password
                  </a>
                </div>
                
                <p>If the button doesn't work, paste this URL into your browser:</p>
                <p style="word-break: break-all; font-size: 14px; background-color: #f7fafc; padding: 10px; border-radius: 4px;">${activationLink}</p>
                
                ${receiptUrl}
                
                <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                  <p>Looking forward to seeing you at our upcoming dining experiences!</p>
                  <p>Warmly,<br>The Eat Meet Club Team</p>
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
