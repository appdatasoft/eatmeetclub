
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useMembershipSubmission = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateTemporaryPassword = () => {
    // Generate a secure random password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const createUserAccount = async (email: string, password: string, name: string) => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password: 'checking-only-not-real-password',
      });

      // If user exists (no error thrown but login failed), return true (user exists)
      if (existingUser.session) {
        return { success: true, existed: true };
      }

      // Create new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          // User exists but wrong password (expected in our check flow)
          return { success: true, existed: true };
        }
        throw error;
      }

      return { success: true, existed: false, user: data.user };
    } catch (error: any) {
      console.error("Error creating user account:", error);
      return { success: false, error: error.message };
    }
  };

  const sendWelcomeEmail = async (email: string, name: string) => {
    try {
      // Get the current origin for generating correct URLs
      const currentOrigin = window.location.origin;
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-custom-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: [email],
            subject: "Welcome to Eat Meet Club!",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4a5568;">Welcome to Eat Meet Club, ${name}!</h2>
                <p>Thank you for becoming a member of our community! We're excited to have you join us.</p>
                <p>We've created an account for you using your email address. To set your password and access your account, please click the button below:</p>
                <div style="margin: 30px 0;">
                  <a href="${currentOrigin}/set-password?email=${encodeURIComponent(email)}" 
                     style="background-color: #4299e1; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                     Set Your Password
                  </a>
                </div>
                <p>If the button doesn't work, you can copy and paste this URL into your browser:</p>
                <p style="word-break: break-all;">${currentOrigin}/set-password?email=${encodeURIComponent(email)}</p>
                <p>Looking forward to seeing you at our upcoming dining experiences!</p>
                <p>Best regards,<br>The Eat Meet Club Team</p>
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

  const handleMembershipSubmit = async (values: any) => {
    // Prevent multiple submissions
    if (isLoading || isSubmitted) {
      toast({
        title: "Processing",
        description: "Your membership request is already being processed",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { name, email, phone, address } = values;
      
      // Validate required fields
      if (!email) {
        throw new Error("Email is required");
      }
      
      if (!name) {
        throw new Error("Name is required");
      }
      
      console.log("Storing user details in localStorage and sessionStorage:", { email, name, phone, address });
      
      // Store all details in BOTH localStorage and sessionStorage for redundancy
      // localStorage
      localStorage.setItem('signup_email', email);
      localStorage.setItem('signup_name', name);
      if (phone) localStorage.setItem('signup_phone', phone);
      if (address) localStorage.setItem('signup_address', address);
      
      // sessionStorage (backup)
      sessionStorage.setItem('signup_email', email);
      sessionStorage.setItem('signup_name', name);
      if (phone) sessionStorage.setItem('signup_phone', phone);
      if (address) sessionStorage.setItem('signup_address', address);
      
      // Double check that email is stored to avoid verification issues
      if (!localStorage.getItem('signup_email')) {
        console.error("Failed to store email in localStorage");
        localStorage.setItem('signup_email', email);
        
        // Check once more
        if (!localStorage.getItem('signup_email')) {
          console.error("Still failed to store email in localStorage, falling back to sessionStorage only");
          // We'll rely on sessionStorage for verification
        }
      }
      
      // Generate a temporary password for the user
      const tempPassword = generateTemporaryPassword();
      
      // Create user account or verify if it already exists
      const userResult = await createUserAccount(email, tempPassword, name);
      
      if (!userResult.success) {
        throw new Error(userResult.error || "Failed to create user account");
      }
      
      // Send welcome email with password reset link
      if (!userResult.existed) {
        const emailSent = await sendWelcomeEmail(email, name);
        if (emailSent) {
          console.log("Welcome email sent successfully");
        } else {
          console.warn("Welcome email could not be sent, continuing with checkout");
        }
      }
      
      // Create a checkout session
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
            createUser: true,
            sendPasswordEmail: true,
            sendInvoiceEmail: true,
            // Added force flags to ensure database records are created
            forceCreateUser: true,
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
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.url) {
        // Mark checkout as initiated to prevent duplicate submissions
        sessionStorage.setItem('checkout_initiated', 'true');
        setIsSubmitted(true);
        
        // Double check that email is stored in both locations
        const checkLocalEmail = localStorage.getItem('signup_email');
        const checkSessionEmail = sessionStorage.getItem('signup_email');
        
        if (!checkLocalEmail && checkSessionEmail) {
          console.log("Email missing from localStorage but found in sessionStorage, restoring");
          localStorage.setItem('signup_email', checkSessionEmail);
        } else if (!checkLocalEmail && !checkSessionEmail) {
          console.error("Email not found in any storage, saving again before redirect");
          localStorage.setItem('signup_email', email);
          sessionStorage.setItem('signup_email', email);
        }
        
        // Redirect directly to Stripe checkout URL
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem starting the checkout process",
        variant: "destructive",
      });
      
      // Don't clear localStorage on error - we might need to retry
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isSubmitted,
    handleMembershipSubmit,
    setIsSubmitted
  };
};

export default useMembershipSubmission;
