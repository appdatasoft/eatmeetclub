
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Define hardcoded fallback values (only used if env variables are missing)
const SUPABASE_URL = 'https://wocfwpedauuhlrfugxuu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2Z3cGVkYXV1aGxyZnVneHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4MjIzNzAsImV4cCI6MjA2MTM5ODM3MH0.ddkNFmDcRtkPA6ubax7_GJxGQ6oNvbmsZ_FTY9DuzhM';

// Get environment variables with fallbacks to the hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

console.log("Initializing Supabase client with:", { 
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length || 0
});

// Initialize Supabase client with explicit configuration to avoid warnings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    // Add fetch configuration with timeout and retry logic
    fetch: (url, options = {}) => {
      const fetchOptions = {
        ...options,
        // Set reasonable timeouts
        signal: options.signal || (AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined),
      };
      
      return fetch(url, fetchOptions);
    }
  }
});

// Add a debug helper to check if the client is working
export const checkSupabaseConnection = async () => {
  try {
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

// Helper function to retry failed requests
export const retryFetch = async (
  fetchFn: () => Promise<any>, 
  maxRetries = 3, 
  delay = 1000
): Promise<any> => {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error) {
      console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error);
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, delay));
      // Exponential backoff
      delay = delay * 1.5;
    }
  }
  throw lastError;
};
