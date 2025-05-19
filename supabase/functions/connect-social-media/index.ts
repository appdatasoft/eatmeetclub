
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Define CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Define the expected request body structure for social media connections
interface SocialMediaConnectionRequest {
  platform: string;
  action?: 'initiate' | 'callback';
  code?: string;
  redirectUri?: string;
}

// Instagram API credentials from environment variables
const INSTAGRAM_CLIENT_ID = Deno.env.get('INSTAGRAM_CLIENT_ID') || '';
const INSTAGRAM_CLIENT_SECRET = Deno.env.get('INSTAGRAM_CLIENT_SECRET') || '';

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
    
    // Create Supabase client with the user's token for proper RLS enforcement
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // Verify the JWT and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract request data
    const requestData: SocialMediaConnectionRequest = await req.json();
    const { platform, action, code, redirectUri } = requestData;

    if (!platform) {
      return new Response(
        JSON.stringify({ error: 'Missing platform parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle different social media platforms
    if (platform.toLowerCase() === 'instagram') {
      return await handleInstagramAuth(action, code, redirectUri, user.id, supabase, corsHeaders);
    } else {
      // For other platforms, use the simulated connection flow (fallback)
      return await handleSimulatedConnection(platform, user.id, supabase, corsHeaders);
    }

  } catch (error) {
    console.error('Error handling social media connection:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleInstagramAuth(
  action?: string,
  code?: string,
  redirectUri?: string,
  userId?: string,
  supabase?: any,
  corsHeaders?: Record<string, string>
) {
  if (!supabase || !userId || !corsHeaders) {
    throw new Error('Missing required parameters');
  }

  // If this is the initial OAuth request
  if (action === 'initiate') {
    // Instagram OAuth authorization URL
    const instagramAuthUrl = new URL('https://api.instagram.com/oauth/authorize');
    
    // Set required parameters
    instagramAuthUrl.searchParams.append('client_id', INSTAGRAM_CLIENT_ID);
    instagramAuthUrl.searchParams.append('redirect_uri', redirectUri || '');
    instagramAuthUrl.searchParams.append('scope', 'user_profile,user_media');
    instagramAuthUrl.searchParams.append('response_type', 'code');
    
    // Return the authorization URL to redirect the user
    return new Response(
      JSON.stringify({ authUrl: instagramAuthUrl.toString() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Handle OAuth callback with code
  else if (action === 'callback' && code && redirectUri) {
    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_CLIENT_ID,
          client_secret: INSTAGRAM_CLIENT_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }).toString(),
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Instagram token exchange failed: ${JSON.stringify(errorData)}`);
      }
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      const instagramUserId = tokenData.user_id;
      
      // Get user profile info
      const profileResponse = await fetch(
        `https://graph.instagram.com/v18.0/${instagramUserId}?fields=id,username&access_token=${accessToken}`
      );
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        throw new Error(`Instagram profile fetch failed: ${JSON.stringify(errorData)}`);
      }
      
      const profileData = await profileResponse.json();
      const username = profileData.username;
      
      // Store connection in database
      const { data: existingConnection } = await supabase
        .from('social_media_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'Instagram')
        .maybeSingle();
      
      let result;
      if (existingConnection) {
        result = await supabase
          .from('social_media_connections')
          .update({
            username,
            profile_url: `https://instagram.com/${username}`,
            is_connected: true,
            updated_at: new Date().toISOString(),
            oauth_token: accessToken,
            meta_data: {
              instagram_user_id: instagramUserId
            }
          })
          .eq('id', existingConnection.id)
          .select();
      } else {
        result = await supabase
          .from('social_media_connections')
          .insert({
            user_id: userId,
            platform: 'Instagram',
            username,
            profile_url: `https://instagram.com/${username}`,
            is_connected: true,
            oauth_token: accessToken,
            meta_data: {
              instagram_user_id: instagramUserId
            }
          })
          .select();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: result.data[0],
          message: `Successfully connected Instagram account: @${username}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('Instagram OAuth error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Instagram authentication failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // If neither initiating nor handling callback, return error
  return new Response(
    JSON.stringify({ error: 'Invalid Instagram authentication action' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleSimulatedConnection(
  platform: string,
  userId: string,
  supabase: any,
  corsHeaders: Record<string, string>
) {
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

  // Check if a connection already exists for this platform and user
  const { data: existingConnection, error: fetchError } = await supabase
    .from('social_media_connections')
    .select('id')
    .eq('user_id', userId)
    .eq('platform', platform)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking existing connection:', fetchError);
    throw fetchError;
  }

  let result;
  if (existingConnection) {
    // Update existing connection
    result = await supabase
      .from('social_media_connections')
      .update({
        username: defaultUsername,
        profile_url: getDefaultProfileUrl(platform),
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
        user_id: userId,
        platform,
        username: defaultUsername,
        profile_url: getDefaultProfileUrl(platform),
        is_connected: true
      })
      .select();
  }

  if (result.error) {
    console.error('Error updating/inserting social media connection:', result.error);
    throw result.error;
  }

  // Return the connection data
  return new Response(
    JSON.stringify({ success: true, data: result.data[0] }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
