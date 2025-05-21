
import { supabase } from "@/integrations/supabase/client";

export const createTicketPayment = async (
  eventId: string, 
  quantity: number, 
  userId: string,
  affiliateId?: string
) => {
  try {
    // Get session token for auth
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      return { error: "Authentication required" };
    }

    // Prepare purchase data
    const purchaseData = {
      eventId,
      quantity,
      affiliateId // Include optional affiliate ID
    };

    // Invoke the edge function to create payment
    const { data, error } = await supabase.functions.invoke("create-ticket-payment", {
      body: { purchaseData },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (error) {
      console.error("Error creating payment:", error);
      return { error: error.message || "Failed to create payment" };
    }

    if (!data?.url) {
      return { error: "No checkout URL returned" };
    }

    return { url: data.url, sessionId: data.sessionId };
  } catch (error: any) {
    console.error("Error in createTicketPayment:", error);
    return { error: error.message || "Failed to create payment" };
  }
};
