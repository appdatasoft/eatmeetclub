
import { RestaurantData } from "../types/apiTypes";

/**
 * Safely extracts restaurant data from various formats returned by Supabase
 */
export const extractRestaurantData = (restaurantData: any): RestaurantData => {
  if (!restaurantData) {
    return { name: 'Unknown' };
  }
  
  // Handle single restaurant object
  if (typeof restaurantData === 'object' && !Array.isArray(restaurantData)) {
    return {
      name: restaurantData.name || 'Unknown',
      city: restaurantData.city,
      state: restaurantData.state
    };
  } 
  
  // Handle potential array structure (first item only)
  if (Array.isArray(restaurantData) && restaurantData.length > 0 &&
      typeof restaurantData[0] === 'object' && restaurantData[0] !== null) {
    return {
      name: restaurantData[0].name || 'Unknown',
      city: restaurantData[0].city,
      state: restaurantData[0].state
    };
  }
  
  // Default fallback
  return { name: 'Unknown' };
};
