
export interface RestaurantData {
  name: string;
  city?: string;
  state?: string;
}

export interface EventFilters {
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  category?: string;
}

export interface RawEventData {
  id: string;
  title: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  cover_image?: string;
  published: boolean;
  user_id: string;
  restaurant_id: string;
  restaurants: RestaurantData;
}
