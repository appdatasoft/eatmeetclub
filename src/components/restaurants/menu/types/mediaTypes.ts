
export interface MediaItem {
  url: string;
  type: "image" | "video";
  id?: string; // File name or identifier to help with deletion
}

export interface MediaUploaderProps {
  initialMediaItems?: MediaItem[];
  onChange: (mediaItems: MediaItem[]) => void;
  restaurantId: string;
  menuItemId?: string;
}
