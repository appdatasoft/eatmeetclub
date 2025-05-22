
import { createClient } from '@supabase/supabase-js';

// Define hardcoded fallback values (only used if env variables are missing)
const SUPABASE_URL = 'https://wocfwpedauuhlrfugxuu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Tests requiring admin access will fail.');
}

// Create a Supabase client with the service role key
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || 'dummy-key-for-type-safety'
);

/**
 * Create a test user with admin API
 */
export async function createTestUser(email: string, password: string, userData?: Record<string, any>) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Cannot create test user.');
  }

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: userData || {
        full_name: 'Test User'
      }
    });

    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Delete a test user with admin API
 */
export async function deleteTestUser(userId: string) {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined. Cannot delete test user.');
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Failed to delete test user:', error);
    throw error;
  }
}
