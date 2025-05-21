
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
          id: string;
          name: string;
          description?: string;
          address: string;
          city: string;
          state: string;
          zipcode: string;
          phone: string;
          website?: string;
          logo_url?: string;
          user_id: string;
          created_at: string;
          updated_at: string;
          cuisine_type: string;
          owner_name?: string;
          owner_email?: string;
          verification_status?: 'pending' | 'submitted' | 'verified' | 'rejected' | null;
          ein_number?: string;
          business_license_number?: string;
          business_license_image_url?: string;
          drivers_license_image_url?: string;
          owner_ssn_last4?: string;
          default_ambassador_fee_percentage?: number;
          verified_at?: string;
          verified_by?: string;
          has_signed_contract?: boolean;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description?: string;
          date: string;
          time: string;
          restaurant_id: string;
          capacity: number;
          price: number;
          user_id: string;
          created_at: string;
          updated_at: string;
          tickets_sold?: number;
          published?: boolean;
          approval_status?: 'pending' | 'approved' | 'rejected' | null;
          approval_date?: string;
          approved_by?: string;
          rejection_date?: string;
          rejected_by?: string;
          rejection_reason?: string;
          submitted_for_approval_at?: string;
          ambassador_fee_percentage?: number;
          cover_image?: string;
          payment_id?: string;
          payment_status?: string;
        };
      };
    };
  };
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
