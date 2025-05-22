
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

// Create a Supabase client with the service role key (this has admin rights)
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY') || '';

if (!serviceRoleKey) {
  console.warn('SERVICE_ROLE_KEY is not defined. Administrative functions will fail.');
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    });
  }

  try {
    // Create supabase client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Get current user from the request to verify they're an admin
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    
    // Validate the token and make sure user is an admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'You must be logged in to access this resource' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the user is an admin using the is_admin function
    const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', { user_id: user.id });
    
    if (adminCheckError || !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Forbidden', message: 'You do not have admin access' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Fetch users from auth schema using service role key
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 50,
    });
    
    if (usersError) {
      return new Response(
        JSON.stringify({ error: usersError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Format user data
    const formattedUsers = users.users.map(user => ({
      id: user.id,
      email: user.email,
      raw_user_meta_data: user.user_metadata
    }));
    
    return new Response(
      JSON.stringify({ data: formattedUsers }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
