
import { supabase } from "../client";

// Add a connection status cache to prevent redundant checks
let connectionCache = {
  isConnected: false,
  lastChecked: 0
};

// Cache duration of 5 minutes (300000ms)
const CONNECTION_CACHE_DURATION = 300000;

/**
 * Tests the Supabase connection and returns a boolean indicating success
 * Uses a cached result if available and recent
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  // Return cached result if recent enough
  const now = Date.now();
  if (now - connectionCache.lastChecked < CONNECTION_CACHE_DURATION) {
    console.log("Using cached connection status:", connectionCache.isConnected);
    return connectionCache.isConnected;
  }
  
  console.log("Testing Supabase connection");
  try {
    // Use a lightweight query with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const { data, error } = await supabase
      .from("app_config")
      .select("key")
      .limit(1)
      .abortSignal(controller.signal);
      
    clearTimeout(timeoutId);

    if (error) {
      console.error("Supabase connection test failed:", error.message);
      connectionCache = { isConnected: false, lastChecked: now };
      return false;
    }

    console.log("Supabase connection successful");
    connectionCache = { isConnected: true, lastChecked: now };
    return true;
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
    connectionCache = { isConnected: false, lastChecked: now };
    return false;
  }
};

/**
 * Checks if a user is logged in and returns a boolean
 */
export const isUserLoggedIn = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error checking user session:", error.message);
      return false;
    }

    return !!data.session;
  } catch (err) {
    console.error("Error in isUserLoggedIn:", err);
    return false;
  }
};
