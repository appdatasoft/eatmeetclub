
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
  restaurants?: {
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
      restaurants(name, city, state)
    `)
    .eq('published', true)
    .order('date', { ascending: true });
    
  if (response.error) {
    console.error("Supabase client query error:", response.error);
    throw response.error;
  }
  
  // Transform the nested restaurants format to our expected RawEventData format
  const transformedData: RawEventData[] = response.data?.map(event => ({
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
    restaurants: event.restaurants ? {
      name: event.restaurants.name,
      city: event.restaurants.city,
      state: event.restaurants.state
    } : undefined
  })) || [];
  
  console.log("Events fetched successfully with Supabase client:", transformedData.length, "events");
  return transformedData;
};

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
  const transformedData: RawEventData[] = rawData.map(event => ({
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
    restaurants: event.restaurants ? {
      name: event.restaurants.name,
      city: event.restaurants.city,
      state: event.restaurants.state
    } : undefined
  }));
  
  return transformedData;
};

export const fetchEvents = async (filters = {}) => {
  const { data, error } = await supabase
    .from('events')
    .select(`
      id, 
      title, 
      date, 
      price, 
      capacity,
      cover_image,
      restaurants (
        name,
        city,
        state
      )
    `)
    // Add filter conditions here based on the filters parameter
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
  
  // Transform the data to match our expected format
  return (data || []).map(event => {
    // Handle the restaurants property correctly
    let restaurantData = { name: 'Unknown', city: '', state: '' };
    
    // Check if restaurants exists and how to access it
    if (event.restaurants) {
      // If it's an object (single restaurant)
      if (typeof event.restaurants === 'object' && !Array.isArray(event.restaurants)) {
        restaurantData.name = event.restaurants.name || 'Unknown';
        restaurantData.city = event.restaurants.city || '';
        restaurantData.state = event.restaurants.state || '';
      }
    }
    
    return {
      id: event.id,
      title: event.title,
      date: event.date,
      price: event.price,
      capacity: event.capacity,
      cover_image: event.cover_image,
      restaurant: restaurantData
    };
  });
};
