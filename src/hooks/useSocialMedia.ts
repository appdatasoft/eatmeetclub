
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SocialMediaConnection {
  id?: string;
  user_id?: string;
  platform: string;
  username?: string;
  profile_url?: string;
  is_connected: boolean;
  created_at?: string;
  updated_at?: string;
  oauth_token?: string;
  oauth_token_secret?: string;
  oauth_expires_at?: string;
  meta_data?: Record<string, any>;
}

export const useSocialMedia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connections, setConnections] = useState<SocialMediaConnection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [oauthPending, setOauthPending] = useState<boolean>(false);

  // Check for OAuth callback in URL
  useEffect(() => {
    const checkForOAuthCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');
      const errorReason = url.searchParams.get('error_reason');
      const errorDescription = url.searchParams.get('error_description');
      
      // If there's an error in the OAuth callback
      if (error || errorReason || errorDescription) {
        setOauthPending(false);
        console.error('OAuth error:', error, errorReason, errorDescription);
        window.history.replaceState({}, document.title, window.location.pathname);
        
        toast({
          title: 'Connection Failed',
          description: errorDescription || errorReason || error || 'Failed to connect social media account',
          variant: 'destructive',
        });
        
        return;
      }
      
      // If this is a Facebook OAuth callback (for both Facebook and Instagram)
      if (code && state && (state.startsWith('facebook_') || state.startsWith('instagram_'))) {
        setOauthPending(true);
        
        const platform = state.startsWith('facebook_') ? 'Facebook' : 'Instagram';
        console.log(`Processing ${platform} OAuth callback with code: ${code.substring(0, 6)}...`);

        try {
          // Clean up URL to remove OAuth params
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Get session to verify authentication
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            throw new Error('No active session found');
          }
          
          // Supabase URL for the edge function
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
          // Use the site's own callback URL
          const redirectUri = `https://eatmeetclub.com/api/auth/callback/facebook`;
          
          // Complete OAuth flow by exchanging code for token
          const response = await fetch(`${supabaseUrl}/functions/v1/connect-social-media`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              platform,
              action: 'callback',
              code,
              redirectUri
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to complete ${platform} authentication`);
          }
          
          const result = await response.json();
          
          // Check if this is a limited access connection
          if (result.limited_access) {
            toast({
              title: `${platform} Connected with Limited Access`,
              description: `Your ${platform} account was connected with limited functionality. Full integration requires app review by Facebook.`,
            });
          } else {
            toast({
              title: `${platform} Connected`,
              description: result.message || `Successfully connected your ${platform} account`,
            });
          }
          
          // Refresh connections list
          await fetchConnections();
        } catch (err: any) {
          console.error('OAuth callback handling error:', err);
          setError(err.message);
          toast({
            title: 'Connection Failed',
            description: err.message || 'Failed to connect social media account',
            variant: 'destructive',
          });
        } finally {
          setOauthPending(false);
        }
      }
    };
    
    checkForOAuthCallback();
  }, []);

  const fetchConnections = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setConnections(data as SocialMediaConnection[] || []);
      return data;
    } catch (err: any) {
      console.error('Error fetching social media connections:', err);
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch social media connections',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const connectSocialMedia = async (platform: string) => {
    if (!user) {
      setError('User not authenticated');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to connect your social media account',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Special handling for Facebook
      if (platform === 'Facebook') {
        return await connectFacebookOAuth();
      }
      
      // Special handling for Instagram
      if (platform === 'Instagram') {
        return await connectInstagramOAuth();
      }
      
      // Get the JWT token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      // Use the environment variable or a hardcoded fallback for the Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/connect-social-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ platform })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Connection failed');
      }

      const result = await response.json();
      
      // Update local state with the new connection
      await fetchConnections();
      
      toast({
        title: 'Success',
        description: `Connected to ${platform} successfully`,
      });
      
      return result.data;
    } catch (err: any) {
      console.error('Error connecting social media:', err);
      setError(err.message);
      toast({
        title: 'Connection Failed',
        description: err.message || 'Failed to connect social media account',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectSocialMedia = async (platform: string) => {
    if (!user) {
      setError('User not authenticated');
      toast({
        title: 'Authentication Required',
        description: 'Please log in to disconnect your social media account',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the JWT token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      // First, find the connection to disconnect
      const connection = connections.find(conn => conn.platform === platform);
      
      if (!connection) {
        throw new Error(`No connected ${platform} account found`);
      }
      
      // Use the environment variable or a hardcoded fallback for the Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
      
      // Call the edge function to disconnect
      const response = await fetch(`${supabaseUrl}/functions/v1/connect-social-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          platform,
          action: 'disconnect'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Disconnection failed');
      }

      // Update local state by removing the disconnected connection
      setConnections(connections.filter(conn => conn.platform !== platform));
      
      toast({
        title: 'Account Disconnected',
        description: `Successfully disconnected your ${platform} account.`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error disconnecting social media:', err);
      setError(err.message);
      toast({
        title: 'Disconnection Failed',
        description: err.message || 'Failed to disconnect social media account',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const connectFacebookOAuth = async () => {
    try {
      // Get the JWT token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      // Generate a state parameter to prevent CSRF
      const state = `facebook_${Math.random().toString(36).substring(2, 15)}`;
      
      // Store state in sessionStorage for verification after redirect
      sessionStorage.setItem('facebook_oauth_state', state);
      
      // Use the site's own callback URL
      const redirectUri = `https://eatmeetclub.com/api/auth/callback/facebook`;
      
      // Use the Supabase URL from environment or fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
      
      // Initiate OAuth flow by getting authorization URL
      const response = await fetch(`${supabaseUrl}/functions/v1/connect-social-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          platform: 'Facebook', 
          action: 'initiate',
          redirectUri,
          state
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate Facebook authentication');
      }
      
      const result = await response.json();
      
      if (!result.authUrl) {
        throw new Error('No authorization URL returned');
      }
      
      // Redirect to Facebook authorization page
      window.location.href = result.authUrl;
      
      return { pending: true };
    } catch (err: any) {
      console.error('Error initiating Facebook OAuth:', err);
      setError(err.message);
      toast({
        title: 'Connection Failed',
        description: err.message || 'Failed to connect Facebook account',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const connectInstagramOAuth = async () => {
    try {
      // Get the JWT token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found');
      }

      // Generate a state parameter to prevent CSRF
      const state = `instagram_${Math.random().toString(36).substring(2, 15)}`;
      
      // Store state in sessionStorage for verification after redirect
      sessionStorage.setItem('instagram_oauth_state', state);
      
      // Use the site's own callback URL
      const redirectUri = `https://eatmeetclub.com/api/auth/callback/facebook`;
      
      console.log("Initiating Instagram OAuth with redirect:", redirectUri);
      
      // Use the Supabase URL from environment or fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wocfwpedauuhlrfugxuu.supabase.co';
      
      // Initiate OAuth flow by getting authorization URL
      const response = await fetch(`${supabaseUrl}/functions/v1/connect-social-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          platform: 'Instagram', 
          action: 'initiate',
          redirectUri,
          state
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Instagram initiation error:", errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to initiate Instagram authentication');
      }
      
      const result = await response.json();
      console.log("Instagram OAuth initiation result:", result);
      
      if (!result.authUrl) {
        throw new Error('No authorization URL returned');
      }
      
      console.log("Redirecting to Instagram auth URL:", result.authUrl);
      
      // Redirect to Instagram authorization page via Facebook
      window.location.href = result.authUrl;
      
      return { pending: true };
    } catch (err: any) {
      console.error('Error initiating Instagram OAuth:', err);
      setError(err.message);
      toast({
        title: 'Connection Failed',
        description: err.message || 'Failed to connect Instagram account',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    connections,
    isLoading,
    oauthPending,
    error,
    fetchConnections,
    connectSocialMedia,
    disconnectSocialMedia,
    getConnectionStatus: (platform: string) => {
      return connections.find(conn => conn.platform === platform)?.is_connected || false;
    }
  };
};
