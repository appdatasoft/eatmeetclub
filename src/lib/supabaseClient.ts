
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

// Request queue implementation to prevent too many concurrent requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrentRequests = 0;
  private maxConcurrentRequests = 2; // Reduced from 3 to 2
  private requestDelay = 500; // Increased from 300ms to 500ms

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.concurrentRequests >= this.maxConcurrentRequests) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.concurrentRequests < this.maxConcurrentRequests) {
      const request = this.queue.shift();
      if (!request) continue;

      this.concurrentRequests++;
      
      try {
        // Add a longer delay between requests
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
        await request();
      } catch (error) {
        console.error('Error processing queued request:', error);
      } finally {
        this.concurrentRequests--;
      }
    }

    this.processing = false;
    
    // If there are still items and we have capacity, process more
    if (this.queue.length > 0 && this.concurrentRequests < this.maxConcurrentRequests) {
      this.processQueue();
    }
  }
}

// Create a global request queue
const requestQueue = new RequestQueue();

// Custom fetch function with retry logic and queue management
const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const fetchWithRetry = async (retries: number, delay: number): Promise<Response> => {
    try {
      // Create a controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased from 10s to 15s timeout
      
      const fetchOptions = {
        ...options,
        signal: controller.signal
      };
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      // If rate limited (429) or server error (5xx), add longer retry delay
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        if (retries === 0) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        const retryDelay = response.status === 429 ? delay * 2 : delay;
        console.warn(`Rate limited or server error (${response.status}). Waiting ${retryDelay}ms before retry.`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchWithRetry(retries - 1, retryDelay * 2);
      }
      
      if (response.ok) {
        return response;
      }
      
      if (retries === 0) {
        throw new Error(`Request failed with status: ${response.status}`);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(retries - 1, delay * 2);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn('Request timed out, retrying...');
        if (retries === 0) throw new Error('Request timed out after multiple retries');
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      
      if (retries === 0) throw error;
      
      // For network errors, retry
      console.warn(`Fetch error: ${error.message}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(retries - 1, delay * 2);
    }
  };
  
  // Queue the request with retry logic
  return requestQueue.add(() => fetchWithRetry(3, 1000));
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
