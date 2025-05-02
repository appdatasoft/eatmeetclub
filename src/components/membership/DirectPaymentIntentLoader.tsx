
import React, { useEffect } from "react";

interface DirectPaymentIntentLoaderProps {
  directIntentId: string | null;
  directClientSecret: string | null;
  setDirectClientSecret: (secret: string | null) => void;
  setIsLoadingIntent: (loading: boolean) => void;
  setValidationError: (error: string | null) => void;
}

const DirectPaymentIntentLoader: React.FC<DirectPaymentIntentLoaderProps> = ({
  directIntentId,
  directClientSecret,
  setDirectClientSecret,
  setIsLoadingIntent,
  setValidationError
}) => {
  // Load direct intent if provided in URL
  useEffect(() => {
    const loadDirectIntent = async () => {
      if (directIntentId && !directClientSecret) {
        setIsLoadingIntent(true);
        try {
          // Fetch the client secret for this payment intent
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/get-payment-intent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentIntentId: directIntentId,
                email: localStorage.getItem('signup_email') || 'guest@example.com'
              }),
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.clientSecret) {
              setDirectClientSecret(data.clientSecret);
            } else {
              setValidationError("Could not retrieve payment information. Please try again.");
            }
          } else {
            setValidationError("Error retrieving payment details. Please try again.");
          }
        } catch (error) {
          console.error("Error loading payment intent:", error);
          setValidationError("Failed to load payment information. Please try again.");
        } finally {
          setIsLoadingIntent(false);
        }
      }
    };
    
    loadDirectIntent();
  }, [directIntentId, directClientSecret, setDirectClientSecret, setIsLoadingIntent, setValidationError]);

  return null; // This component doesn't render anything
};

export default DirectPaymentIntentLoader;
