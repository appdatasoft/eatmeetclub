
export interface MediaItem {
  id: string;
  type: 'image' | 'video' | string;
  url: string;
  menuItemId?: string;
}

export interface MediaUploaderProps {
  initialMediaItems?: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  restaurantId: string;
  menuItemId: string;
}
