
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TicketRevenue, TicketDistributionConfig } from "@/types/ticketDistribution";

export const useTicketDistribution = (eventId: string) => {
  const [distributionConfig, setDistributionConfig] = useState<TicketDistributionConfig>({
    appFeePercentage: 5, // Default platform fee: 5%
    affiliateFeePercentage: 10, // Default affiliate fee: 10% 
    ambassadorFeePercentage: 15, // Default ambassador fee: 15%
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch distribution configuration
  useEffect(() => {
    const fetchDistributionConfig = async () => {
      try {
        setIsLoading(true);
        
        // First check for event-specific configuration
        const { data: eventConfig, error: eventError } = await supabase
          .from('events')
          .select('ambassador_fee_percentage, restaurant_id')
          .eq('id', eventId)
          .single();
          
        if (eventError) throw eventError;
        
        // Then check for restaurant-specific configuration
        const { data: restaurantConfig, error: restaurantError } = await supabase
          .from('restaurants')
          .select('default_ambassador_fee_percentage')
          .eq('id', eventConfig.restaurant_id)
          .single();
          
        if (restaurantError) throw restaurantError;
        
        // Finally fetch global configuration
        const { data: appConfig, error: appError } = await supabase
          .from('app_config')
          .select('key, value')
          .in('key', ['APP_FEE_PERCENTAGE', 'AFFILIATE_FEE_PERCENTAGE'])
          .order('key');
          
        if (appError) throw appError;
        
        // Merge all configurations, with event-specific taking precedence
        const updatedConfig = {
          ...distributionConfig,
          appFeePercentage: Number(appConfig.find(item => item.key === 'APP_FEE_PERCENTAGE')?.value || 5),
          affiliateFeePercentage: Number(appConfig.find(item => item.key === 'AFFILIATE_FEE_PERCENTAGE')?.value || 10),
          ambassadorFeePercentage: Number(
            eventConfig.ambassador_fee_percentage || // Event-specific override
            restaurantConfig.default_ambassador_fee_percentage || // Restaurant default
            15 // Global default
          )
        };
        
        setDistributionConfig(updatedConfig);
      } catch (error) {
        console.error('Error fetching ticket distribution configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDistributionConfig();
  }, [eventId]);
  
  // Calculate revenue distribution for a ticket
  const calculateDistribution = (ticketPrice: number, quantity: number = 1): TicketRevenue => {
    const totalAmount = ticketPrice * quantity;
    
    const appFee = (totalAmount * distributionConfig.appFeePercentage) / 100;
    const affiliateFee = (totalAmount * distributionConfig.affiliateFeePercentage) / 100;
    const ambassadorFee = (totalAmount * distributionConfig.ambassadorFeePercentage) / 100;
    
    // Restaurant gets the remainder
    const restaurantRevenue = totalAmount - (appFee + affiliateFee + ambassadorFee);
    
    return {
      appFee,
      affiliateFee,
      ambassadorFee,
      restaurantRevenue,
      totalAmount
    };
  };
  
  // Update the ambassador fee percentage for a specific event
  const updateAmbassadorFeePercentage = async (percentage: number) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({ ambassador_fee_percentage: percentage })
        .eq('id', eventId);
        
      if (error) throw error;
      
      setDistributionConfig({
        ...distributionConfig,
        ambassadorFeePercentage: percentage
      });
      
      return true;
    } catch (error) {
      console.error('Error updating ambassador fee percentage:', error);
      return false;
    }
  };
  
  return {
    distributionConfig,
    isLoading,
    calculateDistribution,
    updateAmbassadorFeePercentage
  };
};
