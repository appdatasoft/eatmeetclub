
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RestaurantFormValues } from "../schema/restaurantFormSchema";

export const useRestaurantEdit = (onSave: () => void, onClose: () => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const updateRestaurant = async (restaurantId: string, data: RestaurantFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: data.name,
          cuisine_type: data.cuisine_type,
          address: data.address,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          phone: data.phone,
          website: data.website || null,
        })
        .eq("id", restaurantId);

      if (error) throw error;
      
      toast({
        title: "Restaurant updated",
        description: "Restaurant details have been updated successfully",
      });
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    updateRestaurant
  };
};
