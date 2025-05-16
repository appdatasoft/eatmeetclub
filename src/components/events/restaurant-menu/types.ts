
import { MediaItem } from "@/components/restaurants/menu/MenuItemMediaUploader";

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  ingredients?: string[];
  media?: MediaItem[];
}

export interface RestaurantMenuProps {
  restaurantId: string;
}
