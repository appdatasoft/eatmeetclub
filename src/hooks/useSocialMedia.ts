
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
      
      // If this is an Instagram OAuth callback
      if (code && state && state.startsWith('instagram_')) {
        setOauthPending(true);

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
          const redirectUri = `${window.location.origin}${window.location.pathname}`;
          
          // Complete OAuth flow by exchanging code for token
          const response = await fetch(`${supabaseUrl}/functions/v1/connect-social-media`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
              platform: 'Instagram',
              action: 'callback',
              code,
              redirectUri
            })
          });
          
          const result = await response.json();
          
          if (!response.ok || result.error) {
            throw new Error(result.error || 'Failed to complete Instagram authentication');
          }
          
          toast({
            title: 'Instagram Connected',
            description: result.message || 'Successfully connected your Instagram account',
          });
          
          // Refresh connections list
          await fetchConnections();
        } catch (err: any) {
          console.error('OAuth callback handling error:', err);
          setError(err.message);
          toast({
            title: 'Connection Failed',
            description: err.message || 'Failed to connect Instagram account',
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
      
      // For OAuth connections like Instagram, we may need to revoke access
      if (platform === 'Instagram' && connection.oauth_token) {
        // We could call an edge function to revoke the OAuth token if needed
        // For now, we'll just delete the database entry
      }
      
      // Delete the connection from the database
      const { error: deleteError } = await supabase
        .from('social_media_connections')
        .delete()
        .eq('id', connection.id);
        
      if (deleteError) throw deleteError;
      
      // Update local state by removing the disconnected connection
      setConnections(connections.filter(conn => conn.id !== connection.id));
      
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
      
      // Get the redirect URI (current page)
      const redirectUri = `${window.location.origin}${window.location.pathname}`;
      
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
          redirectUri
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate Instagram authentication');
      }
      
      const result = await response.json();
      
      if (!result.authUrl) {
        throw new Error('No authorization URL returned');
      }
      
      // Add state parameter to URL
      const authUrl = new URL(result.authUrl);
      authUrl.searchParams.append('state', state);
      
      // Redirect to Instagram authorization page
      window.location.href = authUrl.toString();
      
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
