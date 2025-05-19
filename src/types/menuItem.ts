
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurant_id: string;
  ingredients?: string[];
  media?: MediaItem[];
  type: string; // Changed from optional to required to match MenuItemCard
}

export interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  menu_item_id: string;
}
