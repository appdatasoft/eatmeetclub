
import { RawEventData } from "../types/apiTypes";
import { extractRestaurantData } from "../utils/restaurantDataUtils";

/**
 * Fetches published events using a direct REST API call
 * Used as a fallback when Supabase client approach fails
 */
export const fetchPublishedEventsWithREST = async (): Promise<RawEventData[] | null> => {
  console.log("Trying direct REST API approach...");
  
  // Use a direct REST API call as fallback
  const publicUrl = `https://wocfwpedauuhlrfugxuu.supabase.co/rest/v1/events?select=id,title,date,time,price,capacity,cover_image,published,user_id,restaurant_id,restaurants(name,city,state)&published=eq.true&order=date.asc`;
  
  console.log("Fetching from public URL:", publicUrl);
  
  const response = await fetch(publicUrl, {
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2Z3cGVkYXV1aGxyZnVneHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjIzNzAsImV4cCI6MjA2MTM5ODM3MH0.ddkNFmDcRtkPA6ubax7_GJxGQ6oNvbmsZ_FTY9DuzhM',
      'Content-Type': 'application/json'
    },
    method: 'GET'
  });
  
  if (!response.ok) {
    console.error("REST API response status:", response.status);
    throw new Error(`REST API request failed with status: ${response.status}`);
  }
  
  const rawData = await response.json();
  console.log("REST API response data:", rawData);
  
  if (!Array.isArray(rawData)) {
    console.error("Unexpected response format:", rawData);
    throw new Error("Unexpected response format from REST API");
  }
  
  // Transform the nested restaurants format to our expected RawEventData format
  const transformedData: RawEventData[] = rawData.map(event => {
    const restaurantData = extractRestaurantData(event.restaurants);
    
    return {
      id: event.id,
      title: event.title,
      date: event.date,
      time: event.time,
      price: event.price,
      capacity: event.capacity,
      cover_image: event.cover_image,
      published: event.published,
      user_id: event.user_id,
      restaurant_id: event.restaurant_id,
      restaurants: restaurantData
    };
  });
  
  return transformedData;
};
