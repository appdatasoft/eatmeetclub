
import { supabase } from "../client";

// Add a connection status cache to prevent redundant checks
let connectionCache = {
  isConnected: false,
  lastChecked: 0,
  failureCount: 0
};

// Cache duration reduced to 2 minutes (120000ms) for more frequent checks when needed
const CONNECTION_CACHE_DURATION = 120000;
// Maximum allowed consecutive failures before suggesting different solutions
const MAX_FAILURES = 5;
// Different timeout values for connection scenarios
const NORMAL_TIMEOUT = 5000;
const RETRY_TIMEOUT = 7000; 

/**
 * Tests the Supabase connection and returns a boolean indicating success
 * Uses a cached result if available and recent
 * @param {boolean} forceCheck - Force a fresh connection check bypassing cache
 */
export const checkSupabaseConnection = async (forceCheck = false): Promise<boolean> => {
  // Return cached result if recent enough and not forcing check
  const now = Date.now();
  if (!forceCheck && now - connectionCache.lastChecked < CONNECTION_CACHE_DURATION) {
    console.log("Using cached connection status:", connectionCache.isConnected);
    return connectionCache.isConnected;
  }
  
  console.log("Testing Supabase connection" + (forceCheck ? " (forced check)" : ""));
  try {
    // Use a lightweight query with proper timeout
    const controller = new AbortController();
    // Use longer timeout for retries
    const timeout = connectionCache.failureCount > 0 ? RETRY_TIMEOUT : NORMAL_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Try to fetch a small amount of data with minimal impact
    const { data, error } = await supabase
      .from("app_config")
      .select("key")
      .limit(1)
      .abortSignal(controller.signal);
      
    clearTimeout(timeoutId);

    if (error) {
      console.error("Supabase connection test failed:", error.message);
      updateConnectionCache(false, now);
      return false;
    }

    console.log("Supabase connection successful");
    // Reset failure count on success
    updateConnectionCache(true, now, 0);
    return true;
  } catch (err) {
    // For AbortError, mark connection issues with progressive backoff
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        console.error("Supabase connection test timed out after " + 
          (connectionCache.failureCount > 0 ? RETRY_TIMEOUT : NORMAL_TIMEOUT) + "ms");
        
        // Use progressive backoff for cache time based on consecutive failures
        const adjustedCacheTime = Math.min(30000 * Math.pow(1.5, connectionCache.failureCount), 180000);
        updateConnectionCache(false, now - CONNECTION_CACHE_DURATION + adjustedCacheTime);
        return false;
      }
      
      console.error("Failed to connect to Supabase:", err.message);
    } else {
      console.error("Unknown connection error:", err);
    }
    
    updateConnectionCache(false, now);
    return false;
  }
};

/**
 * Update connection cache with failure tracking
 */
function updateConnectionCache(isConnected: boolean, timestamp: number, failureCount?: number) {
  connectionCache = { 
    isConnected, 
    lastChecked: timestamp,
    // If failure count is explicitly provided, use it; otherwise increment on failure or reset on success
    failureCount: failureCount !== undefined ? 
      failureCount : 
      (isConnected ? 0 : connectionCache.failureCount + 1)
  };
}

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

/**
 * Get connection diagnostics information to help troubleshoot issues
 */
export const getConnectionDiagnostics = (): Record<string, any> => {
  return {
    isConnected: connectionCache.isConnected,
    lastChecked: new Date(connectionCache.lastChecked).toISOString(),
    consecutiveFailures: connectionCache.failureCount,
    networkOnline: typeof navigator !== 'undefined' ? navigator.onLine : 'unknown',
    cacheExpires: new Date(connectionCache.lastChecked + CONNECTION_CACHE_DURATION).toISOString()
  };
};

/**
 * Reset connection cache to force a fresh check
 */
export const resetConnectionCache = (): void => {
  connectionCache = {
    isConnected: false,
    lastChecked: 0,
    failureCount: 0
  };
  console.log("Connection cache has been reset");
};
