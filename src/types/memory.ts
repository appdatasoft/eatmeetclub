
export interface Memory {
  id: string;
  title: string;
  date: string;
  location: string;
  user_id: string;
  privacy: MemoryPrivacyType;
  restaurant_id?: string;
  event_id?: string;
  created_at: string;
  updated_at: string;
  is_auto_generated?: boolean;
}

export interface MemoryDish {
  id: string;
  memory_id: string;
  dish_name: string;
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

export type MemoryPrivacyType = 'private' | 'public' | 'unlisted';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  zipcode?: string;
  description?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
}
