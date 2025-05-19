
export interface MediaItem {
  id: string;
  type: 'image' | 'video' | string; // Required field
  url: string;
  media_type?: string;
  menu_item_id?: string;
  menuItemId?: string;
}

export interface MediaUploaderProps {
  initialMediaItems?: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  restaurantId: string;
  menuItemId: string;
}
