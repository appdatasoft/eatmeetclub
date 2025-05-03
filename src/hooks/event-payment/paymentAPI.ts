
import { supabase } from "@/integrations/supabase/client";

export interface PaymentResponse {
  url?: string;
  error?: string;
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

    // Call the Supabase Edge Function to create a payment
    const response = await supabase.functions.invoke('create-ticket-payment', {
      body: {
        eventId,
        quantity,
        userId
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.error) {
      throw new Error(response.error.message || "Payment creation failed");
    }

    return response.data || {};
  } catch (error: any) {
    console.error("Error creating ticket payment:", error);
    throw error;
  }
};
