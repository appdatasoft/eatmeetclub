
import { supabase } from "../client";

/**
 * Tests the Supabase connection and returns a boolean indicating success
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Use a lightweight query to check connection
    const { data, error } = await supabase
      .from("app_config")
      .select("key")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error.message);
      return false;
    }

    console.log("Supabase connection successful");
    return true;
  } catch (err) {
    console.error("Failed to connect to Supabase:", err);
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
