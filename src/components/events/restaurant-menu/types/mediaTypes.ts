
// Define media item types for restaurant menu items
export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  isPlaceholder?: boolean;
}

export interface MediaUploaderProps {
  initialMediaItems?: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  restaurantId: string;
  menuItemId: string;
}

export interface MediaPreviewProps {
  mediaItems: MediaItem[];
  onRemove: (index: number) => void;
}
