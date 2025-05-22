import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

// Safely access environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SERVICE_ROLE_KEY = process.env.SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn('[supabaseAdmin] Missing SUPABASE_URL or SERVICE_ROLE_KEY');
}

// Create Supabase admin client
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SERVICE_ROLE_KEY || 'invalid-key'
);

/**
 * Creates a new user using Supabase Admin API
 * @param email - Email address
 * @param password - Password
 * @param userMetadata - Optional user_metadata (must be an object, e.g., { role: 'ambassador' })
 */
export async function createTestUser(
  email: string,
  password: string,
  userMetadata: Record<string, any> = { full_name: 'Test User' }
) {
  if (!SERVICE_ROLE_KEY) {
    throw new Error('❌ SERVICE_ROLE_KEY is missing. Cannot create user.');
  }

  const payload = {
    email,
    password,
    email_confirm: true,
    user_metadata: userMetadata, // ✅ must be a plain object
  };

  console.log('[createTestUser] Payload:', payload);

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser(payload);

    if (error) {
      console.error('[createTestUser] ❌ Supabase error:', error.message);
      throw error;
    }

    return data.user;
  } catch (err) {
    console.error('[createTestUser] ❌ Unexpected error:', err);
    throw err;
  }
}

/**
 * Deletes a user using Supabase Admin API
 * @param userId - Supabase user ID
 */
export async function deleteTestUser(userId: string) {
  if (!SERVICE_ROLE_KEY) {
    throw new Error('❌ SERVICE_ROLE_KEY is missing. Cannot delete user.');
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('[deleteTestUser] ❌ Supabase error:', error.message);
      throw error;
    }

    return true;
  } catch (err) {
    console.error('[deleteTestUser] ❌ Unexpected error:', err);
    throw err;
  }
}
