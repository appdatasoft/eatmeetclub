
export interface Restaurant {
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
  restaurant: Restaurant;
  tickets_sold?: number;
  user_id: string;
  cover_image?: string;
  published: boolean;
}
