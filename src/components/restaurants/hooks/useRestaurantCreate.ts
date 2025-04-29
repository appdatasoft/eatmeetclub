
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { RestaurantFormValues } from "../schema/restaurantFormSchema";

export const useRestaurantCreate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const addRestaurant = async (data: RestaurantFormValues) => {
    setIsLoading(true);
    
    try {
      // Get the current user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error. Please try logging in again.');
      }
      
      if (!session) {
        throw new Error('You must be logged in to add a restaurant');
      }

      console.log('Submitting restaurant with user ID:', session.user.id);
      
      // Insert the restaurant data into the database
      const { data: restaurantData, error } = await supabase
        .from('restaurants')
        .insert([
          { 
            user_id: session.user.id,
            name: data.name,
            cuisine_type: data.cuisine_type,
            address: data.address,
            city: data.city,
            state: data.state,
            zipcode: data.zipcode,
            phone: data.phone,
            website: data.website || null
          }
        ])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Restaurant added successfully:', restaurantData);
      
      toast({
        title: "Restaurant added",
        description: "Your restaurant has been added successfully."
      });
      
      // Navigate to the dashboard
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error adding restaurant:', error);
      toast({
        title: "Error adding restaurant",
        description: error.message || "There was an error adding your restaurant. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    addRestaurant
  };
};
