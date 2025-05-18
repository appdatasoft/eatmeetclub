
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

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

// In-memory request cache for very short-lived requests
const requestCache = new Map<string, { data: any; expiry: number }>();

// Request queue implementation with improved throttling and response handling
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private concurrentRequests = 0;
  private maxConcurrentRequests = 1; // Further reduced to 1 for stricter throttling
  private requestDelay = 1500; // Increased to 1500ms to prevent rapid requests
  private lastRequestTime = 0;
  private rateLimitedUntil = 0;
  private pauseUntil = 0;

  async add<T>(request: () => Promise<T>, cacheKey?: string): Promise<T> {
    // Check if response is in memory cache
    if (cacheKey && requestCache.has(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (cached && cached.expiry > Date.now()) {
        console.log(`Using in-memory cache for ${cacheKey}`);
        return cached.data;
      } else if (cached) {
        requestCache.delete(cacheKey); // Expired cache
      }
    }
    
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // Check if we're rate limited or paused
          const now = Date.now();
          const waitUntil = Math.max(this.rateLimitedUntil, this.pauseUntil);
          
          if (waitUntil > now) {
            const waitTime = waitUntil - now;
            console.log(`Rate limited or paused, waiting ${waitTime}ms`);
            await new Promise(r => setTimeout(r, waitTime));
          }
          
          // Ensure minimum delay between requests
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.requestDelay) {
            const waitTime = this.requestDelay - timeSinceLastRequest;
            await new Promise(r => setTimeout(r, waitTime));
          }
          
          this.lastRequestTime = Date.now();
          
          // Execute the request
          const result = await request();
          
          // Cache the successful response if cache key was provided
          if (cacheKey) {
            requestCache.set(cacheKey, {
              data: result,
              expiry: Date.now() + 60000 // Increased to 60 seconds memory cache
            });
          }
          
          resolve(result);
        } catch (error: any) {
          // If we got a 429 (too many requests), set a longer backoff
          if (error?.status === 429) {
            this.rateLimitedUntil = Date.now() + 120000; // 2 minute backoff
            console.warn('Rate limit encountered, backing off for 2 minutes');
          } 
          // For other errors, brief pause
          else {
            this.pauseUntil = Date.now() + 5000;
            console.warn('Request error, pausing for 5 seconds');
          }
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

// Fix for the body stream already read issue - we need to make sure we don't try to
// read the response body more than once
const handleResponse = async (response: Response): Promise<Response> => {
  // If we get a 429 status code, throw an error to trigger retry logic
  if (response.status === 429) {
    throw new Error(`Rate limit hit (429)`);
  }
  
  // For other error statuses, let Supabase handle them
  return response;
};

// Custom fetch function with retry logic, queue management and improved caching
const customFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Create a cache key based on the request
  const cacheKey = `${url}-${JSON.stringify(options.body || {})}-${options.method || 'GET'}`;
  
  const fetchWithRetry = async (retries: number, delay: number): Promise<Response> => {
    try {
      // Create a controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s timeout
      
      const fetchOptions = {
        ...options,
        signal: controller.signal
      };
      
      // Use the request queue to control concurrency and apply rate limiting
      const response = await requestQueue.add(
        async () => {
          const resp = await fetch(url, fetchOptions);
          return handleResponse(resp);
        },
        options.method === 'GET' ? cacheKey : undefined // Only cache GET requests
      );
      
      clearTimeout(timeoutId);
      
      // If rate limited (429) or server error (5xx), add longer retry delay
      if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
        if (retries === 0) {
          throw new Error(`Request failed with status: ${response.status}`);
        }
        
        const retryDelay = response.status === 429 ? delay * 5 : delay * 3;
        console.warn(`Rate limited or server error (${response.status}). Waiting ${retryDelay}ms before retry.`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchWithRetry(retries - 1, retryDelay);
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
  
  // Initial retry attempt with exponential backoff
  return fetchWithRetry(4, 3000); // Increased retries and initial delay
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
