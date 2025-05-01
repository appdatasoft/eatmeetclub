
import { supabase } from "@/integrations/supabase/client";

export interface RawEventData {
  id: string;
  title: string;
  date: string;
  time?: string;
  price: number;
  capacity: number;
  cover_image?: string;
  published: boolean;
  user_id: string;
  restaurant_id?: string;
  restaurant?: {
    name: string;
    city?: string;
    state?: string;
  };
}

export const fetchPublishedEventsWithSupabase = async (): Promise<RawEventData[] | null> => {
  console.log("Attempting to fetch events with Supabase client...");
  
  const response = await supabase
    .from('events')
    .select(`
      id, 
      title, 
      date, 
      time, 
      price, 
      capacity,
      cover_image,
      published,
      user_id,
      restaurant_id,
      restaurant:restaurants(name, city, state)
    `)
    .eq('published', true)
    .order('date', { ascending: true });
    
  if (response.error) {
    console.error("Supabase client query error:", response.error);
    throw response.error;
  }
  
  console.log("Events fetched successfully with Supabase client:", response.data?.length || 0, "events");
  return response.data;
};

export const fetchPublishedEventsWithREST = async (): Promise<RawEventData[] | null> => {
  console.log("Trying direct REST API approach...");
  
  // Use a direct REST API call as fallback
  const publicUrl = `https://wocfwpedauuhlrfugxuu.supabase.co/rest/v1/events?select=id,title,date,time,price,capacity,cover_image,published,user_id,restaurant_id,restaurant:restaurants(name,city,state)&published=eq.true&order=date.asc`;
  
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
  
  const responseData = await response.json();
  console.log("REST API response data:", responseData);
  
  if (Array.isArray(responseData)) {
    return responseData;
  } else {
    console.error("Unexpected response format:", responseData);
    throw new Error("Unexpected response format from REST API");
  }
};
