
import { MediaItem as RestaurantMediaItem } from "@/components/restaurants/menu";

// Re-export the MediaItem type to make it available for components
export type MediaItem = RestaurantMediaItem;

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  ingredients?: string[];
  media?: MediaItem[];
  restaurant_id?: string;
}

export interface RestaurantMenuProps {
  restaurantId: string;
}
