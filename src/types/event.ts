
export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  description: string;
}

export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  user_id: string;
  published: boolean;
  restaurant: Restaurant;
  cover_image: string;
  tickets_sold: number;
}

export interface EventFilters {
  category?: string;
  date?: string;
  price?: string;
  location?: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
}
