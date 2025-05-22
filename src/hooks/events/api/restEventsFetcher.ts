
import { RawEventData } from "../types/apiTypes";
import { extractRestaurantData } from "../utils/restaurantDataUtils";
import { RetryAlert } from "@/components/ui/RetryAlert";

// Hardcoded fallback keys in case environment variables are missing
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2Z3cGVkYXV1aGxyZnVneHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjIzNzAsImV4cCI6MjA2MTM5ODM3MH0.ddkNFmDcRtkPA6ubax7_GJxGQ6oNvbmsZ_FTY9DuzhM';
const API_URL = 'https://wocfwpedauuhlrfugxuu.supabase.co';

/**
 * Fetches published events using a direct REST API call
 * Used as a fallback when Supabase client approach fails
 */
export const fetchPublishedEventsWithREST = async (): Promise<RawEventData[] | null> => {
  console.log("Trying direct REST API approach...");
  
  // Use a direct REST API call as fallback
  const publicUrl = `${API_URL}/rest/v1/events?select=id,title,date,time,price,capacity,cover_image,published,user_id,restaurant_id,restaurants(name,city,state)&published=eq.true&order=date.asc`;
  
  console.log("Fetching from public URL:", publicUrl);
  
  // Add exponential backoff for retries
  const maxRetries = 2;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      const response = await fetch(publicUrl, {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        method: 'GET'
      });
      
      if (!response.ok) {
        console.error("REST API response status:", response.status);
        console.error("REST API response headers:", Object.fromEntries(response.headers.entries()));
        const errorText = await response.text();
        console.error("REST API error response:", errorText);
        
        // Check if unauthorized - might be an API key issue
        if (response.status === 401) {
          console.error("Unauthorized access - API key might be invalid or expired");
          
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000;
            console.log(`Retrying in ${delay}ms... (Attempt ${retryCount} of ${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
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
    } catch (error: any) {
      if (retryCount >= maxRetries) {
        console.error("All REST API retry attempts failed:", error);
        throw error;
      }
      
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`API error, retrying in ${delay}ms... (Attempt ${retryCount} of ${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Maximum retries exceeded for REST API");
};
