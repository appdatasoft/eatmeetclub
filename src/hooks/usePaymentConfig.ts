
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PaymentConfig {
  membershipFee: number;
  currency: string;
  taxRate: number;
}

export const usePaymentConfig = () => {
  const [config, setConfig] = useState<PaymentConfig>({
    membershipFee: 0,
    currency: 'USD',
    taxRate: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch configuration from API endpoint
        const response = await fetch('/api/payment-config');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch payment configuration: ${response.status}`);
        }
        
        const { data } = await response.json();
        
        if (data) {
          setConfig({
            membershipFee: data.membershipFee || 25,
            currency: data.currency || 'USD',
            taxRate: data.taxRate || 0.07
          });
        }
      } catch (err: any) {
        setError(err);
        console.error('Error fetching payment configuration:', err);
        toast({
          title: 'Error loading payment configuration',
          description: err.message || 'Please try again later',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConfig();
  }, [toast]);

  return {
    ...config,
    isLoading,
    error
  };
};
