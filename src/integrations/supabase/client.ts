
import { createClient } from '@supabase/supabase-js';

// Define hardcoded fallback values (only used if env variables are missing)
const SUPABASE_URL = 'https://wocfwpedauuhlrfugxuu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2Z3cGVkYXV1aGxyZnVneHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjIzNzAsImV4cCI6MjA2MTM5ODM3MH0.ddkNFmDcRtkPA6ubax7_GJxGQ6oNvbmsZ_FTY9DuzhM';

// Get environment variables with fallbacks to the hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

// Create a single Supabase client instance with local storage for persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
});

// Add a function to check if Supabase connection is working
export const checkSupabaseConnection = async () => {
  try {
    // Use a simple query that doesn't require any specific table
    const { error } = await supabase.from('app_config').select('key').limit(1);
    if (error) {
      console.error('Supabase connection check failed:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
};

// Add a function to reset connection cache if needed
export const resetConnectionCache = () => {
  console.log('Resetting Supabase connection cache');
  // This is a placeholder for any connection reset logic we might need later
  return true;
};
