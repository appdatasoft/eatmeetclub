
import { createClient } from '@supabase/supabase-js';

// Define hardcoded fallback values (only used if env variables are missing)
const SUPABASE_URL = 'https://wocfwpedauuhlrfugxuu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2Z3cGVkYXV1aGxyZnVneHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjIzNzAsImV4cCI6MjA2MTM5ODM3MH0.ddkNFmDcRtkPA6ubax7_GJxGQ6oNvbmsZ_FTY9DuzhM';

// Get environment variables with fallbacks to the hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

// Validate that we have both URL and key before creating the client
if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL - Using fallback URL');
}

if (!supabaseAnonKey) {
  console.error('Missing SUPABASE_ANON_KEY - Using fallback key');
}

// Log initialization for debugging
console.log(`Initializing Supabase client with URL: ${supabaseUrl.substring(0, 20)}...`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
