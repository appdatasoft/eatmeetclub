
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { Json } from '@/integrations/supabase/types';

export interface SocialMediaConnection {
  id: string;
  user_id: string;
  platform: string;
  username?: string;
  oauth_token?: string;
  oauth_token_secret?: string;
  oauth_expires_at?: string;
  profile_url?: string;
  meta_data?: Record<string, any>;
  is_connected: boolean;
  created_at: string;
  updated_at: string;
}

export const useSocialMedia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<SocialMediaConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user's social media connections
  const fetchConnections = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('social_media_connections')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Transform data to match our internal type
      const transformedConnections: SocialMediaConnection[] = data.map(conn => ({
        id: conn.id,
        user_id: conn.user_id,
        platform: conn.platform,
        username: conn.username || undefined,
        oauth_token: conn.oauth_token || undefined,
        oauth_token_secret: conn.oauth_token_secret || undefined,
        oauth_expires_at: conn.oauth_expires_at || undefined,
        profile_url: conn.profile_url || undefined,
        meta_data: conn.meta_data as Record<string, any> || {},
        is_connected: conn.is_connected,
        created_at: conn.created_at,
        updated_at: conn.updated_at
      }));
      
      setConnections(transformedConnections);
    } catch (err: any) {
      console.error('Error fetching social media connections:', err);
      setError(err.message || 'Failed to load social media connections');
      toast({
        title: 'Error',
        description: 'Failed to load social media connections',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Connect a social media platform
  const connectPlatform = async (platform: string) => {
    try {
      // This would typically redirect to an OAuth flow
      const { data, error } = await supabase.functions.invoke('connect-social-media', {
        body: { platform }
      });
      
      if (error) throw error;
      
      // Redirect to the authorization URL
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err: any) {
      console.error(`Error connecting to ${platform}:`, err);
      toast({
        title: 'Connection Failed',
        description: `Could not connect to ${platform}. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  // Disconnect a social media platform
  const disconnectPlatform = async (connectionId: string) => {
    if (!user) return;
    
    try {
      // Update the is_connected status
      const { error } = await supabase
        .from('social_media_connections')
        .update({ is_connected: false })
        .eq('id', connectionId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Update local state
      setConnections(prev =>
        prev.map(conn =>
          conn.id === connectionId ? { ...conn, is_connected: false } : conn
        )
      );
      
      toast({
        title: 'Disconnected',
        description: 'Social media account has been disconnected.',
      });
    } catch (err: any) {
      console.error('Error disconnecting social media:', err);
      toast({
        title: 'Error',
        description: 'Failed to disconnect social media account',
        variant: 'destructive',
      });
    }
  };

  // Load connections when user changes
  useEffect(() => {
    fetchConnections();
  }, [user]);

  return {
    connections,
    isLoading,
    error,
    connectPlatform,
    disconnectPlatform,
    refreshConnections: fetchConnections
  };
};
