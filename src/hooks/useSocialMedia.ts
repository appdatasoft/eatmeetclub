
import { useState } from 'react';
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
}

export const useSocialMedia = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [connections, setConnections] = useState<SocialMediaConnection[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return {
    connections,
    isLoading,
    error,
    fetchConnections,
    connectSocialMedia,
    getConnectionStatus: (platform: string) => {
      return connections.find(conn => conn.platform === platform)?.is_connected || false;
    }
  };
};
