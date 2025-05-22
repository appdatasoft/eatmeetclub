
export interface MemoryDish {
  id: string;
  dish_name: string;
  memory_id: string;
  user_id: string;
  created_at: string;
}

export interface MemoryAttendee {
  id: string;
  memory_id: string;
  user_id: string;
  is_tagged?: boolean;
  created_at: string;
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

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  date: string;
  location: string;
  event_id?: string;
  restaurant_id?: string;
  privacy: 'private' | 'friends' | 'public';
  is_auto_generated?: boolean;
  created_at: string;
  updated_at: string;
  dishes?: MemoryDish[];
  attendees?: MemoryAttendee[];
  content?: MemoryContent[];
}
