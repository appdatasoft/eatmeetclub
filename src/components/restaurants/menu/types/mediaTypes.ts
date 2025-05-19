
export interface MediaItem {
  id: string;
  type: 'image' | 'video' | string;
  url: string;
  menuItemId?: string;
}
