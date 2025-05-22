
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { fetchWithRetry } from '@/utils/fetchUtils';

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

// Maximum number of retries for fetching feature flags
const MAX_RETRIES = 1;
// Initial timeout for fetch operations (milliseconds)
const INITIAL_TIMEOUT = 2500;
// Minimum time between fetch attempts (milliseconds) - limits excessive fetching
const MIN_FETCH_INTERVAL = 10000;

export const useFeatureFlags = (retryTrigger = 0) => {
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>(DEFAULT_FEATURE_FLAGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const currentEnv = getCurrentEnvironment();
  const lastFetchTimeRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);
  
  // Use callback to allow retrying from components
  const fetchFeatureFlags = useCallback(async () => {
    // Skip if we've fetched recently to prevent infinite loops
    const now = Date.now();
    if (now - lastFetchTimeRef.current < MIN_FETCH_INTERVAL && lastFetchTimeRef.current !== 0) {
      console.log("Skipping feature flags fetch due to rate limiting");
      return;
    }
    
    lastFetchTimeRef.current = now;
    
    try {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching feature flags...");

      // Start with default flags
      const flagsMap: Record<string, boolean> = { ...DEFAULT_FEATURE_FLAGS };
      
      try {
        // Create an AbortController for the timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), INITIAL_TIMEOUT);
        
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
          .eq('feature_flag_values.environment', currentEnv)
          .abortSignal(controller.signal);
          
        clearTimeout(timeoutId);
        
        if (error) {
          console.warn('Error fetching feature flags:', error);
          // Continue with default flags
        } else if (data) {
          data.forEach((item: any) => {
            const isEnabled = item.feature_flag_values?.[0]?.is_enabled || false;
            flagsMap[item.feature_key] = isEnabled;
          });
          console.log("Successfully fetched feature flags:", data.length);
        }
      } catch (fetchError) {
        console.warn('Error in feature flags fetch:', fetchError);
        // If it's an abort error, log differently
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
          console.warn('Feature flags fetch timed out, using defaults');
        }
        // Continue with default flags
      }

      // If user is authenticated, try to get user-specific overrides
      if (user) {
        try {
          // Create an AbortController for the timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), INITIAL_TIMEOUT);
          
          const { data: userTargeting, error: userError } = await supabase
            .from('user_feature_targeting')
            .select(`
              id,
              feature_id,
              is_enabled,
              feature_flags!inner(feature_key)
            `)
            .eq('user_id', user.id)
            .abortSignal(controller.signal);
            
          clearTimeout(timeoutId);
          
          if (userError) {
            console.warn('Error fetching user targeting:', userError);
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
          console.warn('Error processing user targeting:', userFetchError);
          // Continue with the flags we already have
          if (userFetchError instanceof DOMException && userFetchError.name === 'AbortError') {
            console.warn('User targeting fetch timed out, using default values');
          }
        }
      }

      if (isMountedRef.current) {
        setFeatureFlags(flagsMap);
      }
    } catch (err: any) {
      console.error('Error in useFeatureFlags hook:', err);
      if (isMountedRef.current) {
        setError(err);
        // Don't show toast for repeated errors to avoid spamming the user
        if (retryTrigger === 0) {
          toast({
            title: 'Feature flags could not be loaded',
            description: 'Using default configuration. Some features may be limited.',
            variant: 'destructive',
          });
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [currentEnv, user, toast, retryTrigger]);

  // Fetch flags when component mounts or retryTrigger changes
  useEffect(() => {
    isMountedRef.current = true;
    // Use a smaller delay for initial load and larger for retries
    const delay = retryTrigger === 0 ? 100 : 2000;
    
    const timerId = setTimeout(() => {
      if (isMountedRef.current) {
        fetchFeatureFlags();
      }
    }, delay);
    
    return () => {
      clearTimeout(timerId);
      isMountedRef.current = false;
    };
  }, [fetchFeatureFlags]);

  // Check if a specific feature is enabled
  const isFeatureEnabled = useCallback((featureKey: string): boolean => {
    // Default to true for core features and false for others
    return featureFlags[featureKey] ?? DEFAULT_FEATURE_FLAGS[featureKey] ?? false;
  }, [featureFlags]);

  return {
    isLoading,
    error,
    featureFlags,
    isFeatureEnabled,
    currentEnvironment: currentEnv,
  };
};
