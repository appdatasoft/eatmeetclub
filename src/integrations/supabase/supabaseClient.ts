
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { handleResponse } from './utils/responseUtils';
import { requestQueue } from './utils/requestQueue';

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

// Custom fetch function with retry logic, queue management and improved caching
const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Queue the request with necessary handling
  return await requestQueue.add(async () => {
    // Always clone the request to ensure we don't encounter "already used" errors
    const requestOptions = { ...options };
    
    // Perform the fetch with proper response handling
    const response = await fetch(url, requestOptions);
    
    // Use the handleResponse utility to prevent "body stream already read" errors
    return handleResponse(response);
  }, options.method === 'GET' ? url : undefined);
};

// Initialize Supabase client with explicit configuration to avoid warnings
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    fetch: customFetch
  }
});
