
import { supabase } from "@/integrations/supabase/client";

export interface PaymentResponse {
  url?: string;
  error?: string;
  sessionId?: string;
}

export const createTicketPayment = async (
  eventId: string, 
  quantity: number, 
  userId: string
): Promise<PaymentResponse> => {
  try {
    // Get user session for authorization
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    
    if (!token) {
      throw new Error("User not authenticated");
    }

    console.log("Creating ticket payment with params:", {
      eventId, quantity, userId,
      timestamp: new Date().toISOString()
    });

    // Call the Supabase Edge Function to create a payment
    const response = await supabase.functions.invoke('create-ticket-payment', {
      body: {
        purchaseData: {
          eventId,
          quantity,
          unitPrice: 0, // Will be determined by the backend
          serviceFee: 0, // Will be calculated by the backend
          totalAmount: 0 // Will be calculated by the backend
        }
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Payment function response:", response);

    if (response.error) {
      console.error("Error from payment function:", response.error);
      return { 
        error: response.error.message || "Payment creation failed"
      };
    }

    if (!response.data?.url) {
      console.error("No URL in response:", response.data);
      return { 
        error: "No checkout URL returned"
      };
    }

    console.log("Payment session created successfully with URL:", response.data.url);
    
    return {
      url: response.data.url,
      sessionId: response.data.sessionId
    };
  } catch (error: any) {
    console.error("Error creating ticket payment:", error);
    return {
      error: error.message || "Failed to create payment session"
    };
  }
};
