
import { useState, useEffect, useCallback } from 'react';
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

// Mock connections to use as fallback when API fails
const MOCK_CONNECTIONS: SocialMediaConnection[] = [
  {
    platform: 'Instagram',
    is_connected: false
  },
  {
    platform: 'Facebook',
    is_connected: false
  },
  {
    platform: 'X/Twitter',
    is_connected: false
  },
  {
    platform: 'YouTube',
    is_connected: false
  },
  {
    platform: 'Google Business',
    is_connected: false
  },
  {
    platform: 'Google Maps',
    is_connected: false
  },
  {
    platform: 'TikTok',
    is_connected: false
  },
  {
    platform: 'Yelp',
    is_connected: false
  }
];

export const useSocialMedia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connections, setConnections] = useState<SocialMediaConnection[]>(MOCK_CONNECTIONS);
  const [error, setError] = useState<Error | null>(null);
  const [oauthPending, setOauthPending] = useState<boolean>(false);

  // Check for OAuth callback in URL
  useEffect(() => {
    // Check if we're returning from an OAuth flow
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_provider')) {
      setOauthPending(true);
      
      // This would normally be handled by a dedicated callback handler
      setTimeout(() => {
        setOauthPending(false);
        fetchConnections();
      }, 1000);
    }
  }, []);

  const fetchConnections = useCallback(async () => {
    if (!user) {
      setError(new Error('User not authenticated'));
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Set a timeout promise to cancel the fetch if it takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection fetch timeout')), 5000);
      });
      
      // Create the fetch promise
      const fetchPromise = supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', user.id);
      
      // Race between fetch and timeout
      const { data, error } = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => {
          throw new Error('Connection fetch timed out');
        })
      ]) as any;

      if (error) throw error;

      // Merge with mock connections to ensure all platforms are represented
      if (data && Array.isArray(data)) {
        const platforms = data.map(conn => conn.platform);
        const mergedConnections = [...data];
        
        // Add mock entries for any platforms not present in the data
        MOCK_CONNECTIONS.forEach(mock => {
          if (!platforms.includes(mock.platform)) {
            mergedConnections.push(mock);
          }
        });
        
        setConnections(mergedConnections);
      } else {
        // Fall back to mock connections
        setConnections(MOCK_CONNECTIONS);
      }
      
      return data;
    } catch (err: any) {
      console.error('Error fetching social media connections:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      
      // Use mock connections as fallback
      setConnections(MOCK_CONNECTIONS);
      
      toast({
        title: 'Connection Error',
        description: 'Failed to fetch social media connections. Using offline mode.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const connectSocialMedia = async (platform: string) => {
    if (!user) {
      setError(new Error('User not authenticated'));
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
      // Simulate successful connection for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state with mock connection
      const updatedConnections = connections.map(conn => 
        conn.platform === platform 
          ? { ...conn, is_connected: true, username: `user_${platform.toLowerCase()}` } 
          : conn
      );
      
      setConnections(updatedConnections);
      
      toast({
        title: 'Success',
        description: `Connected to ${platform} successfully`,
      });
      
      return { platform, is_connected: true, username: `user_${platform.toLowerCase()}` };
    } catch (err: any) {
      console.error('Error connecting social media:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      
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
      setError(new Error('User not authenticated'));
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
      // Simulate disconnect for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state by marking platform as disconnected
      setConnections(connections.map(conn => 
        conn.platform === platform 
          ? { ...conn, is_connected: false, username: undefined } 
          : conn
      ));
      
      toast({
        title: 'Account Disconnected',
        description: `Successfully disconnected your ${platform} account.`,
      });
      
      return true;
    } catch (err: any) {
      console.error('Error disconnecting social media:', err);
      setError(err instanceof Error ? err : new Error(err.message || 'Unknown error'));
      
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
