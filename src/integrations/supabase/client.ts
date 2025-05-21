
import { supabase } from './supabaseClient';

// Export the supabase client
export { supabase };

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
