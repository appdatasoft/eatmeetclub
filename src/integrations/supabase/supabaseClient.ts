
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Define a type for the database schema
export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          verification_status: 'pending' | 'submitted' | 'verified' | 'rejected' | null;
        };
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
