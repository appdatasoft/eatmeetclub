
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  restaurant_id: string;
  ingredients?: string[];
  media?: MediaItem[];
}

export interface RestaurantMenuProps {
  restaurantId: string;
}
