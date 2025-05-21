
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
  is_enabled?: boolean;
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

// Define default feature flags to use when API is unavailable
const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  // Enable all core features by default
  'social-media-integration': true,
  'user-profiles': true,
  'event-creation': true,
  'restaurant-management': true,
  'payment-processing': true,
};

export const useFeatureFlags = (retryTrigger = 0) => {
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>(DEFAULT_FEATURE_FLAGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const currentEnv = getCurrentEnvironment();
  
  // Use callback to allow retrying from components
  const fetchFeatureFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching feature flags...");

      // Start with default flags
      const flagsMap: Record<string, boolean> = { ...DEFAULT_FEATURE_FLAGS };
      
      try {
        // Try to get feature flags from Supabase with a timeout
        const fetchPromise = supabase
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
        
        // Set a timeout for the fetch operation
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Fetch timeout after 5 seconds'));
          }, 5000);
        });
        
        // Race between fetch and timeout
        const { data } = await Promise.race([
          fetchPromise,
          timeoutPromise.then(() => {
            throw new Error('Fetch timeout');
          })
        ]) as { data: any };
        
        if (data) {
          data.forEach((item: any) => {
            const isEnabled = item.feature_flag_values?.[0]?.is_enabled || false;
            flagsMap[item.feature_key] = isEnabled;
          });
          console.log("Successfully fetched feature flags:", data.length);
        }
      } catch (fetchError) {
        console.error('Error fetching feature flags:', fetchError);
        // Continue with default flags
      }

      // If user is authenticated, try to get user-specific overrides
      if (user) {
        try {
          // Set a timeout for user targeting fetch
          const fetchPromise = supabase
            .from('user_feature_targeting')
            .select(`
              id,
              feature_id,
              is_enabled,
              feature_flags!inner(feature_key)
            `)
            .eq('user_id', user.id);
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('User targeting fetch timeout'));
            }, 3000);
          });
          
          const { data: userTargeting, error: userError } = await Promise.race([
            fetchPromise,
            timeoutPromise.then(() => {
              throw new Error('User targeting fetch timeout');
            })
          ]) as { data: any, error: any };
          
          if (userError) {
            console.error('Error fetching user targeting:', userError);
          } else if (userTargeting && Array.isArray(userTargeting)) {
            userTargeting.forEach((targeting) => {
              const featureKey = targeting.feature_flags?.feature_key;
              if (featureKey) {
                flagsMap[featureKey] = targeting.is_enabled;
              }
            });
            console.log("Applied user targeting overrides:", userTargeting.length);
          }
        } catch (userFetchError) {
          console.error('Error processing user targeting:', userFetchError);
          // Continue with the flags we already have
        }
      }

      setFeatureFlags(flagsMap);
    } catch (err: any) {
      console.error('Error in useFeatureFlags hook:', err);
      setError(err);
      // Don't show toast for repeated errors to avoid spamming the user
      if (retryTrigger === 0) {
        toast({
          title: 'Feature flags could not be loaded',
          description: 'Using default configuration. Some features may be limited.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentEnv, user, toast, retryTrigger]);

  // Fetch flags when component mounts or retryTrigger changes
  useEffect(() => {
    fetchFeatureFlags();
  }, [fetchFeatureFlags]);

  // Check if a specific feature is enabled
  const isFeatureEnabled = (featureKey: string): boolean => {
    // Default to true for core features and false for others
    return featureFlags[featureKey] ?? DEFAULT_FEATURE_FLAGS[featureKey] ?? false;
  };

  return {
    isLoading,
    error,
    featureFlags,
    isFeatureEnabled,
    currentEnvironment: currentEnv,
  };
};
