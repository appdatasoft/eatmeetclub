
import { RestaurantData } from "../types/apiTypes";

/**
 * Safely extracts restaurant data from the nested response structure
 * Handles different possible response formats to ensure consistent data
 */
export const extractRestaurantData = (restaurantData: any): RestaurantData => {
  // Case 1: No data provided at all
  if (!restaurantData) {
    return {
      name: "Unknown Restaurant",
    };
  }
  
  // Case 2: Already in the expected format
  if (typeof restaurantData === 'object' && 'name' in restaurantData) {
    return {
      name: restaurantData.name || "Unknown Restaurant",
      city: restaurantData.city,
      state: restaurantData.state,
    };
  }
  
  // Case 3: Array format (sometimes happens with Supabase response)
  if (Array.isArray(restaurantData) && restaurantData.length > 0) {
    const firstRestaurant = restaurantData[0];
    return {
      name: firstRestaurant.name || "Unknown Restaurant",
      city: firstRestaurant.city,
      state: firstRestaurant.state,
    };
  }
  
  // Default case: If we can't parse it, return default values
  return {
    name: "Unknown Restaurant",
  };
};

/**
 * Formats restaurant location from city and state
 */
export const formatRestaurantLocation = (city?: string, state?: string): string => {
  if (city && state) {
    return `${city}, ${state}`;
  } else if (city) {
    return city;
  } else if (state) {
    return state;
  }
  return "Location not available";
};
