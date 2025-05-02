
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PaymentVerificationProps {
  setIsProcessing: (value: boolean) => void;
}

export const usePaymentVerification = ({ setIsProcessing }: PaymentVerificationProps) => {
  const { toast } = useToast();
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);

  const verifyPayment = async (paymentId: string) => {
    // Prevent multiple verification attempts
    if (isVerifying) {
      console.log("Payment verification already in progress, skipping");
      return false;
    }
    
    // Limit verification attempts to prevent spam
    if (verificationAttempts >= 3) {
      console.log("Maximum verification attempts reached");
      toast({
        title: "Verification limit reached",
        description: "We're still processing your payment. Please check your email for confirmation.",
      });
      return false;
    }
    
    // Check if we have the required email in localStorage BEFORE setting any state
    const storedEmail = localStorage.getItem('signup_email');
    if (!storedEmail) {
      console.error("Missing email for payment verification in usePaymentVerification");
      toast({
        title: "Verification failed",
        description: "Missing email for payment verification. Please try signing up again.",
        variant: "destructive",
      });
      return false;
    }
    
    setIsVerifying(true);
    setIsProcessing(true);
    setVerificationError(null);
    setVerificationAttempts(prev => prev + 1);
    
    try {
      // Get user details from localStorage
      const storedName = localStorage.getItem('signup_name');
      const storedPhone = localStorage.getItem('signup_phone');
      const storedAddress = localStorage.getItem('signup_address');
      
      console.log("Verifying payment with session ID:", paymentId);
      console.log("User details:", { email: storedEmail, name: storedName, phone: storedPhone });
      
      // First attempt: try with simplified verification
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            paymentId,
            email: storedEmail,
            name: storedName || "Guest User",
            phone: storedPhone || null,
            address: storedAddress || null,
            isSubscription: true,
            simplifiedVerification: false,      // Try full verification first
            forceCreateUser: true,              // Force user creation in auth table
            sendPasswordEmail: true,            // Request password email
            createMembershipRecord: true,       // Ensure membership record creation
            sendInvoiceEmail: true,             // Request invoice email
            preventDuplicateEmails: true,       // Prevent duplicate emails
            retryAttempted: false               // Mark as first attempt
          }),
        }
      );
      
      // Get response text and parse it as JSON
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Error parsing response:", error, responseText);
        throw new Error(`Invalid response from server: ${responseText.substring(0, 100)}...`);
      }
      
      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }
      
      console.log("Payment verification response:", data);
      
      // Handle response based on success status
      if (data.success) {
        // Check if membership was created
        if (!data.membershipCreated) {
          console.log("Membership not created on first attempt, trying with safe mode");
          
          // Try again with safe mode to avoid stack errors
          const retryResponse = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/verify-membership-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                paymentId,
                email: storedEmail,
                name: storedName || "Guest User",
                phone: storedPhone || null,
                address: storedAddress || null,
                isSubscription: true,
                simplifiedVerification: false,    // Try full verification
                forceCreateUser: true,
                sendPasswordEmail: true,
                createMembershipRecord: true,
                sendInvoiceEmail: true,
                safeMode: true,                   // Add safe mode flag
                retryAttempted: true,             // Mark as retry attempt
                preventDuplicateEmails: true
              }),
            }
          );
          
          const retryData = await retryResponse.json();
          console.log("Safe mode verification retry response:", retryData);
        }
        
        toast({
          title: "Payment successful!",
          description: "Your membership has been activated. Check your email for login instructions.",
        });
        
        // Clean up localStorage and sessionStorage
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_address');
        sessionStorage.removeItem('checkout_initiated');
        
        // Send invoice email directly if needed
        if (data.invoiceEmailNeeded) {
          try {
            console.log("Sending invoice email separately");
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/send-invoice-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  sessionId: paymentId,
                  email: storedEmail,
                  name: storedName,
                  preventDuplicate: true
                }),
              }
            );
            console.log("Invoice email sent separately");
          } catch (emailError) {
            console.error("Failed to send invoice email separately:", emailError);
            // Don't fail the process for this
          }
        }
        
        return true;
      } else {
        throw new Error(data.message || "Payment verification failed");
      }
    } catch (error: any) {
      console.error("Payment verification error:", error);
      setVerificationError(error.message || "There was a problem verifying your payment");
      toast({
        title: "Error",
        description: error.message || "There was a problem verifying your payment",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
      setIsVerifying(false);
    }
  };

  return { verifyPayment, verificationError, isVerifying, verificationAttempts };
};

export default usePaymentVerification;
