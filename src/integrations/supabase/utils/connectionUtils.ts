
// Connection utilities for managing Supabase connections
import { supabase } from '../supabaseClient';

// Store connection status
let connectionChecked = false;
let isConnected = false;

/**
 * Check if the Supabase connection is working
 * Returns true if connection is working, false otherwise
 */
export const checkSupabaseConnection = async () => {
  // If we've already checked and are connected, return immediately
  if (connectionChecked && isConnected) {
    return true;
  }
  
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('app_config').select('key').limit(1);
    
    if (error) {
      console.error('Supabase connection check failed:', error);
      isConnected = false;
      connectionChecked = true;
      return false;
    }
    
    console.log('Supabase connection successful');
    isConnected = true;
    connectionChecked = true;
    return true;
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
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
};

/**
 * Get the current connection status without performing a check
 */
export const getConnectionStatus = () => {
  return { checked: connectionChecked, connected: isConnected };
};
