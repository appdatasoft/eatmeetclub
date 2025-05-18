
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentConfig {
  serviceFeePercent: number;
  commissionFeePercent: number;
  stripeMode: 'test' | 'live';
}

const fetchPaymentConfig = async (): Promise<PaymentConfig> => {
  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select('*')
      .in('key', ['service_fee_percent', 'commission_fee_percent', 'stripe_mode']);

    if (error) throw error;
    
    // Default values
    const config: PaymentConfig = {
      serviceFeePercent: 5,
      commissionFeePercent: 10,
      stripeMode: 'test',
    };
    
    // Update with data from database
    if (data) {
      data.forEach((item) => {
        if (item.key === 'service_fee_percent') {
          config.serviceFeePercent = parseFloat(item.value) || 5;
        } else if (item.key === 'commission_fee_percent') {
          config.commissionFeePercent = parseFloat(item.value) || 10;
        } else if (item.key === 'stripe_mode') {
          config.stripeMode = item.value === 'live' ? 'live' : 'test';
        }
      });
    }
    
    return config;
  } catch (error) {
    console.error('Error fetching payment config:', error);
    // Return defaults if there's an error
    return {
      serviceFeePercent: 5,
      commissionFeePercent: 10,
      stripeMode: 'test',
    };
  }
};

export function usePaymentConfig() {
  return useQuery({
    queryKey: ['paymentConfig'],
    queryFn: fetchPaymentConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
