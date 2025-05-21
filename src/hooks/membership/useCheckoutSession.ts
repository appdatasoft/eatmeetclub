
import { supabase } from "@/integrations/supabase/client";

export interface CheckoutOptions {
  createUser?: boolean;
  sendPasswordEmail?: boolean;
  checkExisting?: boolean;
  sendInvoiceEmail?: boolean;
  restaurantId?: string;
}

export const useCheckoutSession = () => {
  const createCheckoutSession = async (
    email: string,
    name: string,
    phone: string,
    address: string,
    options: CheckoutOptions = {}
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-membership-checkout",
        {
          body: {
            email,
            name,
            phone,
            address,
            options
          }
        }
      );

      if (error) {
        throw new Error(error.message || "Failed to create checkout session");
      }

      return data;
    } catch (error: any) {
      console.error("Error in createCheckoutSession:", error);
      throw error;
    }
  };

  return {
    createCheckoutSession
  };
};

// No default export, only named export
