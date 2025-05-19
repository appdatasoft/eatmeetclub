
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

interface WebhookPayload {
  type: string;
  table: string;
  record: any;
  schema: string;
  old_record: any | null;
}

// Define user object types for clarity
interface UserMetadata {
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

interface UserObject {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  app_metadata: any;
  [key: string]: any;
}

serve(async (req) => {
  try {
    // Extract the auth token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized, missing or invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get token from header
    const token = authHeader.split(' ')[1];
    
    // Create a Supabase client with the server key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Verify the token to check if the user is an admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !authData.user) {
      console.error('Auth verification failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if the current user is an admin
    const { data: isAdmin } = await supabaseAdmin.rpc('is_admin', {
      user_id: authData.user.id
    });
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // If the user is an admin, fetch all users
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, raw_user_meta_data');

    if (error) {
      console.error('Error fetching users:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Transform the data to include user_metadata for client compatibility
    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      user_metadata: user.raw_user_meta_data || {}
    }));
    
    // Return the formatted users
    return new Response(
      JSON.stringify(formattedUsers),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
