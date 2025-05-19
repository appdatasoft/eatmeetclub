
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define the expected request body structure for social media connections
interface SocialMediaConnectionRequest {
  platform: string;
  username?: string;
  profileUrl?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the token (Bearer token)
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract request data
    const requestData: SocialMediaConnectionRequest = await req.json();
    const { platform, username, profileUrl } = requestData;

    if (!platform) {
      return new Response(
        JSON.stringify({ error: 'Missing platform parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simulate platform-specific authentication
    // In a real implementation, this would redirect to the platform OAuth flow
    // or handle API key authentication
    
    // Check if a connection already exists for this platform and user
    const { data: existingConnection, error: fetchError } = await supabase
      .from('social_media_connections')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing connection:', fetchError);
    }

    // Generate platform-specific default values
    const defaultUsername = 'connected-user';
    const getDefaultProfileUrl = (platform: string) => {
      switch (platform.toLowerCase()) {
        case 'youtube':
          return `https://www.youtube.com/channel/example`;
        default:
          return `https://example.com/${platform.toLowerCase()}/profile`;
      }
    };

    let result;
    if (existingConnection) {
      // Update existing connection
      result = await supabase
        .from('social_media_connections')
        .update({
          username: username || defaultUsername,
          profile_url: profileUrl || getDefaultProfileUrl(platform),
          updated_at: new Date().toISOString(),
          is_connected: true
        })
        .eq('id', existingConnection.id)
        .select();
    } else {
      // Create new connection
      result = await supabase
        .from('social_media_connections')
        .insert({
          user_id: user.id,
          platform,
          username: username || defaultUsername,
          profile_url: profileUrl || getDefaultProfileUrl(platform),
          is_connected: true
        })
        .select();
    }

    if (result.error) {
      throw result.error;
    }

    // Return the connection data
    return new Response(
      JSON.stringify({ success: true, data: result.data[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error handling social media connection:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
