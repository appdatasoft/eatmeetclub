import { RestaurantData } from '../types/apiTypes';

/**
 * Safely extracts restaurant data from potentially diverse data structures
 * returned by Supabase
 */
export const extractRestaurantData = (restaurantData: any): RestaurantData => {
  // Handle case when restaurant data is null or undefined
  if (!restaurantData) {
    return {
      name: 'Unknown Restaurant',
      city: undefined,
      state: undefined
    };
  }
  
  // If we already have an object with name, it might be in the format we expect
  if (typeof restaurantData === 'object' && restaurantData !== null) {
    // If it's an array, take the first item (common in some Supabase responses)
    if (Array.isArray(restaurantData)) {
      const firstRestaurant = restaurantData[0];
      return {
        name: firstRestaurant?.name || 'Unknown Restaurant',
        city: firstRestaurant?.city,
        state: firstRestaurant?.state
      };
    }
    
    // Otherwise return the object properties
    return {
      name: restaurantData.name || 'Unknown Restaurant',
      city: restaurantData.city,
      state: restaurantData.state
    };
  }
  
  // If we got a string or other primitive, use it as the name
  if (typeof restaurantData === 'string') {
    return {
      name: restaurantData,
      city: undefined,
      state: undefined
    };
  }
  
  // Default case
  return {
    name: 'Unknown Restaurant',
    city: undefined,
    state: undefined
  };
};
