
import { memory_privacy_type, memory_mood_type } from '@/integrations/supabase/types';

export interface Memory {
  id: string;
  title: string;
  event_id?: string;
  restaurant_id?: string;
  user_id: string;
  date: string;
  location: string;
  privacy: memory_privacy_type;
  created_at: string;
  updated_at: string;
  is_auto_generated?: boolean;
}

export interface MemoryContent {
  id: string;
  memory_id: string;
  content_type: string;
  content_url?: string;
  content_text?: string;
  created_at: string;
  updated_at: string;
}

export interface MemoryAttendee {
  id: string;
  memory_id: string;
  user_id: string;
  is_tagged: boolean;
  created_at: string;
}

export interface MemoryDish {
  id: string;
  memory_id: string;
  user_id: string;
  dish_name: string;
  created_at: string;
}

export interface MemoryWithRelations extends Memory {
  content?: MemoryContent[];
  attendees?: MemoryAttendee[];
  dishes?: MemoryDish[];
  restaurant?: any;
  event?: any;
}
