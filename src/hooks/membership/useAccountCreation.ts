
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling user account creation functionality
 */
export const useAccountCreation = () => {
  /**
   * Generates a secure random temporary password
   */
  const generateTemporaryPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  /**
   * Creates a user account or checks if one exists
   */
  const createUserAccount = async (email: string, password: string, name: string) => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password: 'checking-only-not-real-password',
      });

      // If user exists (no error thrown but login failed), return true (user exists)
      if (existingUser.session) {
        return { success: true, existed: true };
      }

      // Create new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          // User exists but wrong password (expected in our check flow)
          return { success: true, existed: true };
        }
        throw error;
      }

      return { success: true, existed: false, user: data.user };
    } catch (error: any) {
      console.error("Error creating user account:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    generateTemporaryPassword,
    createUserAccount
  };
};

export default useAccountCreation;
