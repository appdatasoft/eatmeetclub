
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";

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
