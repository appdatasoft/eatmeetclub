
import { supabase } from '@/integrations/supabase/client';

export interface MembershipStatus {
  active: boolean;
  remainingDays: number;
  proratedAmount: number;
  userExists: boolean;
  productInfo?: {
    name?: string;
    description?: string;
  } | null;
}

export const useInvoiceEmail = () => {
  const checkActiveMembership = async (email: string): Promise<MembershipStatus | null> => {
    if (!email) return null;
    
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      const { data, error } = await supabase.functions.invoke('check-membership-status', {
        body: { email, timestamp },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (error) {
        console.error('Error checking membership status:', error);
        return null;
      }

      return {
        active: data.active || false,
        remainingDays: data.remainingDays || 0,
        proratedAmount: data.proratedAmount || 25,
        userExists: data.userExists || false,
        productInfo: data.productInfo || null
      };
    } catch (error) {
      console.error('Error checking membership:', error);
      return null;
    }
  };

  // Add the missing getInvoiceReceiptUrl method
  const getInvoiceReceiptUrl = async (sessionId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-invoice-receipt', {
        body: { sessionId }
      });

      if (error) {
        console.error('Error getting invoice receipt URL:', error);
        return null;
      }

      return data?.receiptUrl || null;
    } catch (error) {
      console.error('Error getting invoice receipt:', error);
      return null;
    }
  };

  // Add the missing sendInvoiceEmail method
  const sendInvoiceEmail = async (paymentId: string, email: string, name: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice-email', {
        body: { 
          sessionId: paymentId,
          email,
          name
        }
      });

      if (error) {
        console.error('Error sending invoice email:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return false;
    }
  };

  return {
    checkActiveMembership,
    getInvoiceReceiptUrl,
    sendInvoiceEmail
  };
};
