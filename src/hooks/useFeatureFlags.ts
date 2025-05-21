
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface FeatureFlag {
  id: string;
  feature_key: string;
  display_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  is_enabled?: boolean; // This comes from the joined flag values
}

export interface FeatureFlagValue {
  id: string;
  feature_id: string;
  environment: AppEnvironment;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFeatureTargeting {
  id: string;
  feature_id: string;
  user_id: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

// Determine the current environment
const getCurrentEnvironment = (): AppEnvironment => {
  // In a real application, this would be set based on deployment environment
  // For now, we'll use a simple check of the URL
  if (window.location.hostname.includes('staging')) {
    return 'staging';
  } else if (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')) {
    return 'development';
  }
  return 'production';
};

export const useFeatureFlags = () => {
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const currentEnv = getCurrentEnvironment();

  // Fetch feature flags from Supabase
  useEffect(() => {
    const fetchFeatureFlags = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('feature_flags')
          .select(`
            id,
            feature_key,
            display_name,
            description,
            feature_flag_values!inner(
              id,
              environment,
              is_enabled
            )
          `)
          .eq('feature_flag_values.environment', currentEnv);

        if (error) throw error;

        // Initialize flags map with environmental defaults
        const flagsMap: Record<string, boolean> = {};
        
        if (data) {
          data.forEach(item => {
            const isEnabled = item.feature_flag_values?.[0]?.is_enabled || false;
            flagsMap[item.feature_key] = isEnabled;
          });
        }

        // If user is authenticated, check for user-specific overrides
        if (user) {
          try {
            // Use the RPC function to get user-specific feature targeting
            const { data: userTargeting, error: userError } = await supabase
              .rpc('get_user_feature_targeting', {
                user_uuid: user.id
              });

            if (userError) {
              console.error('Error fetching user feature targeting:', userError);
            } else if (userTargeting && Array.isArray(userTargeting)) {
              // Apply user-specific overrides
              userTargeting.forEach((override) => {
                if (override.feature_key && override.is_enabled !== undefined) {
                  flagsMap[override.feature_key] = override.is_enabled;
                }
              });
            }
          } catch (userFetchError) {
            console.error('Error processing user targeting:', userFetchError);
          }
        }

        setFeatureFlags(flagsMap);
      } catch (err: any) {
        console.error('Error fetching feature flags:', err);
        setError(err);
        toast({
          title: 'Failed to load feature flags',
          description: err.message || 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatureFlags();
  }, [currentEnv, user, toast]);

  // Check if a specific feature is enabled
  const isFeatureEnabled = (featureKey: string): boolean => {
    return featureFlags[featureKey] || false;
  };

  return {
    isLoading,
    error,
    featureFlags,
    isFeatureEnabled,
    currentEnvironment: currentEnv,
  };
};
