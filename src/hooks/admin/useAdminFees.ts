
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type FeeType = 'flat' | 'percentage';

export interface FeeConfig {
  restaurant_monthly_fee: number;
  signup_commission_value: number;
  signup_commission_type: FeeType;
  ticket_commission_value: number;
  ticket_commission_type: FeeType;
}

export const useAdminFees = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const fetchFees = async (): Promise<FeeConfig> => {
    try {
      console.log('Fetching fee configuration...');
      
      const { data: feeData, error } = await supabase
        .from('admin_config')
        .select('key, value')
        .in('key', [
          'restaurant_monthly_fee',
          'signup_commission_value',
          'signup_commission_type',
          'ticket_commission_value',
          'ticket_commission_type'
        ]);

      if (error) {
        console.error('Error fetching fee config:', error);
        throw new Error(`Failed to fetch fee configuration: ${error.message}`);
      }

      console.log('Fee data received:', feeData);

      // Default values
      const config: FeeConfig = {
        restaurant_monthly_fee: 50,
        signup_commission_value: 10,
        signup_commission_type: 'percentage',
        ticket_commission_value: 5,
        ticket_commission_type: 'percentage'
      };

      // Update with data from database
      if (feeData && feeData.length > 0) {
        for (const item of feeData) {
          if (item.key === 'restaurant_monthly_fee') {
            config.restaurant_monthly_fee = parseFloat(item.value);
          } else if (item.key === 'signup_commission_value') {
            config.signup_commission_value = parseFloat(item.value);
          } else if (item.key === 'signup_commission_type') {
            config.signup_commission_type = item.value as FeeType;
          } else if (item.key === 'ticket_commission_value') {
            config.ticket_commission_value = parseFloat(item.value);
          } else if (item.key === 'ticket_commission_type') {
            config.ticket_commission_type = item.value as FeeType;
          }
        }
      }

      return config;
    } catch (error) {
      console.error('Error in fetchFees:', error);
      throw error;
    }
  };

  const { data: fees, isLoading, error } = useQuery({
    queryKey: ['adminFees'],
    queryFn: fetchFees,
    retry: 1,
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  const updateFee = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | number }) => {
      console.log('Updating fee:', key, value);
      
      try {
        // Check if the record exists first
        const { data: existingData, error: checkError } = await supabase
          .from('admin_config')
          .select('id')
          .eq('key', key)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error checking if fee exists:', checkError);
          throw checkError;
        }
          
        let result;
        
        if (existingData) {
          // Update existing record
          const { data, error } = await supabase
            .from('admin_config')
            .update({ value: value.toString() })
            .eq('key', key)
            .select();
            
          if (error) throw error;
          result = data;
        } else {
          // Insert new record
          const { data, error } = await supabase
            .from('admin_config')
            .insert({ key, value: value.toString() })
            .select();
            
          if (error) throw error;
          result = data;
        }
        
        console.log('Fee update result:', result);
        return result;
      } catch (err) {
        console.error('Error in updateFee mutation:', err);
        throw err;
      }
    },
    onSuccess: () => {
      toast({
        title: "Fee updated",
        description: "The fee has been updated successfully."
      });
      setIsEditing(null);
      queryClient.invalidateQueries({ queryKey: ['adminFees'] });
    },
    onError: (error: any) => {
      console.error('Error updating fee:', error);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating the fee.",
        variant: "destructive"
      });
    }
  });

  const handleSave = async (key: string, value: string | number) => {
    updateFee.mutate({ key, value });
  };

  return {
    fees,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    handleSave,
    isSaving: updateFee.isPending
  };
};
