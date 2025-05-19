
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  restaurant_id: string;
  ingredients?: string[];
  media?: MediaItem[];
  type: string; // This is already required
}

export interface MediaItem {
  id: string;
  url: string;
  media_type: string;
  menu_item_id: string;
  type?: string; // Keep for compatibility
}
