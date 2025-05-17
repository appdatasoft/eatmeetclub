
import { MediaItem } from '../types/mediaTypes';

export interface MenuItemFormValues {
  id?: string;
  name: string;
  description: string;
  price: number;
  type: string;
  ingredients: string[];
  media?: MediaItem[];
}
