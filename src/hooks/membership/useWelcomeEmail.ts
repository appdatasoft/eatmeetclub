
import { supabase } from "@/integrations/supabase/client";
import { useInvoiceEmail } from "./useInvoiceEmail";

/**
 * Hook for handling welcome email functionality
 */
export const useWelcomeEmail = () => {
  const { getInvoiceReceiptUrl } = useInvoiceEmail();
  
  /**
   * Validates email data to prevent undefined placeholders
   */
  const validateEmailData = (email: string, name: string): { valid: boolean, email: string, name: string } => {
    // Sanitize name and email
    const sanitizedName = (!name || name === "undefined") ? "Member" : name.trim();
    const isEmailValid = email && email !== "undefined" && email.includes('@');
    
    return {
      valid: isEmailValid,
      email: isEmailValid ? email : "",
      name: sanitizedName
    };
  };
  
  /**
   * Sends a combined welcome and activation email to the user
   */
  const sendWelcomeEmail = async (email: string, name: string, sessionId?: string) => {
    try {
      // Validate the data first
      const { valid, email: validEmail, name: validName } = validateEmailData(email, name);
      
      if (!valid) {
        console.error("Invalid email data for welcome email:", { email, name });
        return false;
      }
      
      // Get the current origin for generating correct URLs
      // Never use localhost in production emails - use the actual domain
      const currentOrigin = window.location.origin.includes('localhost') 
        ? "https://www.eatmeetclub.com" 
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
      
      // Generate a magic link using the Supabase Admin API via our Edge Function
      // This creates a combined activation + password setup link
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/generate-magic-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: validEmail,
            // Explicitly setting the complete URL for the set-password page
            redirectUrl: `${currentOrigin}/set-password`
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error generating magic link:", errorData);
        throw new Error(errorData.message || "Error generating activation link");
      }

      const { magicLink } = await response.json();
      
      if (!magicLink) {
        throw new Error("Failed to generate magic link");
      }

      console.log("Generated magic link for email:", validEmail);
      
      // Send the branded welcome email with the magic link using our custom email function
      const emailResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-custom-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: [validEmail],
            subject: "Welcome to Eat Meet Club - Activate Your Account",
            fromName: "Eat Meet Club",
            fromEmail: "info@eatmeetclub.com",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a5568;">Welcome to Eat Meet Club, ${validName}!</h2>
                
                <p>We're thrilled to have you join our community. Your account has been created using <strong>${validEmail}</strong>.</p>
                
                <p>Click below to activate your account and set your password:</p>
                
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${magicLink}" 
                     style="padding: 12px 24px; background: #ff5b2e; color: white; border-radius: 5px; display: inline-block; text-decoration: none; font-weight: bold;">
                     Activate Account & Set Password
                  </a>
                </div>
                
                <p>If the button doesn't work, copy and paste this link in your browser:</p>
                <p style="word-break: break-all; font-size: 14px; background-color: #f7fafc; padding: 10px; border-radius: 4px;">${magicLink}</p>
                
                ${receiptUrl}
                
                <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                  <p>We look forward to seeing you at our next dining experience!</p>
                  <p>Warmly,<br>The Eat Meet Club Team</p>
                </div>
              </div>
            `,
            emailType: "welcome",
          }),
        }
      );

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
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
