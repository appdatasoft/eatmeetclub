
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
  } | any; // Add any to handle various types that might come from Supabase
}

export interface RestaurantData {
  name: string;
  city?: string;
  state?: string;
}

export interface EventFilters {
  // Add filter properties as needed
  // date?: string;
  // category?: string;
}
