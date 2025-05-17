
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MenuItem, MenuFetcherResult } from "../types/menuTypes";
import { fetchMenuItemMedia, fetchMenuItemIngredients } from "../utils/mediaUtils";

/**
 * Hook to fetch menu items for a restaurant
 */
export const useMenuItemsFetcher = (restaurantId: string): MenuFetcherResult => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuTypes, setMenuTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!restaurantId) {
        console.log("No restaurantId provided to RestaurantMenuPreview");
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
          setMenuItems([]);
          setIsLoading(false);
          return;
        }

        console.log(`Found ${menuItemsData.length} menu items for restaurant ${restaurantId}`);

        // Process each menu item to fetch related data
        const itemsWithDetails = await Promise.all(menuItemsData.map(async (item) => {
          // Fetch ingredients
          console.log(`Fetching ingredients for item: ${item.name} (${item.id})`);
          const ingredients = await fetchMenuItemIngredients(item.id);
          
          // Fetch media items with better error handling
          console.log(`Fetching media for item: ${item.name} (${item.id})`);
          const media = await fetchMenuItemMedia(restaurantId, item);
          console.log(`Media fetched for ${item.name}: ${media.length} items`);
          
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            // Fixed: Use a default type instead of accessing a non-existent property
            type: 'Other', // Default type if not present
            ingredients: ingredients,
            media: media
          } as MenuItem;
        }));
        
        // Add debugging log to check media loading for each item
        console.log("Items with media loaded:", itemsWithDetails.map(i => ({
          name: i.name,
          mediaCount: i.media?.length || 0,
          firstImage: i.media && i.media.length > 0 ? i.media[0].url : 'none'
        })));
        
        // Group items by type for display
        const types = [...new Set(itemsWithDetails.map(item => item.type || 'Other'))];
        
        setMenuItems(itemsWithDetails);
        setMenuTypes(types);
      } catch (error: any) {
        console.error("Error loading menu items:", error);
        setError("Failed to load restaurant menu");
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchMenuItems();
    } else {
      setIsLoading(false);
    }
  }, [restaurantId]);

  return { menuItems, menuTypes, isLoading, error };
};
