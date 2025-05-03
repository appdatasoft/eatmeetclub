
import { supabase } from "@/integrations/supabase/client";

export const verifyPaymentStatus = async (sessionId: string): Promise<boolean> => {
  try {
    // Get user session for authorization
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    if (!token) {
      throw new Error("User not authenticated");
    }

    // Call the Supabase Edge Function to verify payment status
    const response = await supabase.functions.invoke('verify-ticket-payment', {
      body: { sessionId },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message || "Payment verification failed");
    }

    return response.data?.success || false;
  } catch (error: any) {
    console.error("Error verifying ticket payment:", error);
    return false;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
