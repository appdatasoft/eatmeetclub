
// Connection utilities for managing Supabase connections
import { supabase } from '../supabaseClient';

// Store connection status
let connectionChecked = false;
let isConnected = false;
let lastConnectionAttempt = 0;
let lastError = null;
let consecutiveFailures = 0;

/**
 * Check if the Supabase connection is working
 * Returns true if connection is working, false otherwise
 */
export const checkSupabaseConnection = async (forceCheck = false) => {
  // If we've already checked and are connected, return immediately
  // unless forceCheck is true
  if (connectionChecked && isConnected && !forceCheck) {
    return true;
  }
  
  try {
    console.log('Testing Supabase connection...');
    lastConnectionAttempt = Date.now();
    
    const { data, error } = await supabase.from('app_config').select('key').limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      lastError = error;
      consecutiveFailures++;
      isConnected = false;
      connectionChecked = true;
      return false;
    }
    
    console.log('Supabase connection successful');
    isConnected = true;
    connectionChecked = true;
    consecutiveFailures = 0;
    lastError = null;
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    lastError = error;
    consecutiveFailures++;
    isConnected = false;
    connectionChecked = true;
    return false;
  }
};

/**
 * Reset the connection cache, forcing a new connection check
 */
export const resetConnectionCache = () => {
  connectionChecked = false;
  isConnected = false;
  consecutiveFailures = 0;
};

/**
 * Get the current connection status without performing a check
 */
export const getConnectionStatus = () => {
  return { checked: connectionChecked, connected: isConnected };
};

/**
 * Get diagnostic information about the connection for troubleshooting
 * Returns an object with diagnostic data
 */
export const getConnectionDiagnostics = () => {
  return {
    checked: connectionChecked,
    connected: isConnected,
    lastAttempt: lastConnectionAttempt ? new Date(lastConnectionAttempt).toISOString() : null,
    timeElapsed: lastConnectionAttempt ? Date.now() - lastConnectionAttempt : null,
    consecutiveFailures,
    lastError: lastError ? {
      message: lastError.message,
      code: lastError.code,
      details: lastError.details,
    } : null,
    supabaseUrl: supabase.supabaseUrl?.substring(0, 30) + '...',
    anon_key_length: supabase.supabaseKey?.length || 0,
  };
};
