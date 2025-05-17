
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, MenuFetcherResult } from "../types/menuTypes";
import { fetchMenuItemMedia, fetchMenuItemIngredients } from "../utils/mediaUtils";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch menu items for a restaurant
 */
export const useMenuItemsFetcher = (restaurantId: string): MenuFetcherResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuTypes, setMenuTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        console.log("No restaurantId provided to useMenuItemsFetcher");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching menu items for restaurant:", restaurantId);
        
        // Fetch menu items
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('restaurant_menu_items')
          .select('*')
          .eq('restaurant_id', restaurantId);

        if (menuItemsError) {
          console.error("Error fetching menu items:", menuItemsError);
          throw menuItemsError;
        }
        
        if (!menuItemsData || menuItemsData.length === 0) {
          console.log("No menu items found for restaurant:", restaurantId);
          if (isMounted) {
            setMenuItems([]);
            setIsLoading(false);
          }
          return;
        }

        console.log(`Found ${menuItemsData.length} menu items for restaurant ${restaurantId}`);

        // Process each menu item to fetch related data
        const items = await Promise.all(menuItemsData.map(async (item) => {
          try {
            // Fetch ingredients
            const ingredients = await fetchMenuItemIngredients(item.id);
            
            // Fetch media items with better error handling
            console.log(`Fetching media for item: ${item.name} (${item.id})`);
            const media = await fetchMenuItemMedia(restaurantId, item);
            
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'Other', // Default type
              ingredients: ingredients,
              media: media
            } as MenuItem;
          } catch (itemError) {
            console.error(`Error processing menu item ${item.id}:`, itemError);
            // Return the item without the data that failed to load
            return {
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'Other',
              ingredients: [],
              media: [{
                url: "https://images.unsplash.com/photo-1546241072-48010ad2862c?auto=format&fit=crop&w=300&h=300",
                type: "image"
              }]
            } as MenuItem;
          }
        }));
        
        // Group items by type for display
        const types = [...new Set(items.map(item => item.type || 'Other'))];
        
        if (isMounted) {
          setMenuItems(items);
          setMenuTypes(types);
        }
      } catch (error: any) {
        console.error("Error loading menu items:", error);
        if (isMounted) {
          setError("Failed to load restaurant menu");
          toast({
            title: "Error",
            description: "Could not load restaurant menu items",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchMenuItems();
    
    return () => {
      isMounted = false;
    };
  }, [restaurantId, toast]);

  return { menuItems, menuTypes, isLoading, error };
};
