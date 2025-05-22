
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentConfig {
  serviceFeePercent: number;
  commissionFeePercent: number;
  stripeMode: 'test' | 'live';
}

const fetchPaymentConfig = async (): Promise<PaymentConfig> => {
  const { data, error } = await supabase
    .from('admin_config')
    .select('*')
    .in('key', [
      'service_fee_percent',
      'commission_fee_percent',
      'stripe_mode',
      'ticket_commission_value',
      'signup_commission_value'
    ]);

  if (error) {
    console.error(error);
    return {
      serviceFeePercent: 0,
      commissionFeePercent: 0,
      stripeMode: 'test'
    };
  }

  const config: PaymentConfig = {
    serviceFeePercent: 0,
    commissionFeePercent: 0,
    stripeMode: 'test'
  };

  data?.forEach((item) => {
    if (item.key === 'service_fee_percent') {
      config.serviceFeePercent = parseFloat(item.value) || 0;
    } else if (item.key === 'commission_fee_percent') {
      config.commissionFeePercent = parseFloat(item.value) || 0;
    } else if (item.key === 'ticket_commission_value' && !data.some(d => d.key === 'service_fee_percent')) {
      config.serviceFeePercent = parseFloat(item.value) || 0;
    } else if (item.key === 'signup_commission_value' && !data.some(d => d.key === 'commission_fee_percent')) {
      config.commissionFeePercent = parseFloat(item.value) || 0;
    } else if (item.key === 'stripe_mode') {
      config.stripeMode = item.value === 'live' ? 'live' : 'test';
    }
  });

  return config;
};

export function usePaymentConfig() {
  return useQuery({
    queryKey: ['paymentConfig'],
    queryFn: fetchPaymentConfig,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}
