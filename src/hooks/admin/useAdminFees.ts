
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

      // Start with empty config
      const config: Partial<FeeConfig> = {};
      
      // Update with data from database
      if (feeData && feeData.length > 0) {
        feeData.forEach(item => {
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
        });
      }
      
      // Check if we have all the required values, insert any missing ones
      const missingKeys: { key: string, value: string }[] = [];
      
      if (config.restaurant_monthly_fee === undefined) {
        const defaultValue = 0;
        config.restaurant_monthly_fee = defaultValue;
        missingKeys.push({ key: 'restaurant_monthly_fee', value: defaultValue.toString() });
      }
      
      if (config.signup_commission_value === undefined) {
        const defaultValue = 0;
        config.signup_commission_value = defaultValue;
        missingKeys.push({ key: 'signup_commission_value', value: defaultValue.toString() });
      }
      
      if (config.signup_commission_type === undefined) {
        const defaultValue = 'percentage' as FeeType;
        config.signup_commission_type = defaultValue;
        missingKeys.push({ key: 'signup_commission_type', value: defaultValue });
      }
      
      if (config.ticket_commission_value === undefined) {
        const defaultValue = 0;
        config.ticket_commission_value = defaultValue;
        missingKeys.push({ key: 'ticket_commission_value', value: defaultValue.toString() });
      }
      
      if (config.ticket_commission_type === undefined) {
        const defaultValue = 'percentage' as FeeType;
        config.ticket_commission_type = defaultValue;
        missingKeys.push({ key: 'ticket_commission_type', value: defaultValue });
      }
      
      // Insert any missing default values
      if (missingKeys.length > 0) {
        console.log('Inserting missing fee values:', missingKeys);
        
        try {
          for (const item of missingKeys) {
            await supabase.from('admin_config').insert({ key: item.key, value: item.value });
          }
        } catch (insertError) {
          console.error('Error inserting missing fee values:', insertError);
          // Continue with defaults even if insert fails
        }
      }

      return config as FeeConfig;
    } catch (error) {
      console.error('Error in fetchFees:', error);
      throw error;
    }
  };

  const { data: fees, isLoading, error, refetch } = useQuery({
    queryKey: ['adminFees'],
    queryFn: fetchFees,
    retry: 2,
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
    isSaving: updateFee.isPending,
    refetch
  };
};
