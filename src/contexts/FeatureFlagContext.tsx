
import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { useFeatureFlags, AppEnvironment } from '@/hooks/useFeatureFlags';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FeatureFlagContextType {
  isLoading: boolean;
  error: Error | null;
  featureFlags: Record<string, boolean>;
  isFeatureEnabled: (featureKey: string) => boolean;
  currentEnvironment: AppEnvironment;
  retryLoading: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const [retryCount, setRetryCount] = useState(0);
  const featureFlagState = useFeatureFlags(retryCount);
  
  // Retry function that will be passed down to components
  const retryLoading = () => {
    setRetryCount(prev => prev + 1);
  };
  
  return (
    <FeatureFlagContext.Provider value={{ ...featureFlagState, retryLoading }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlagContext = () => {
  const context = useContext(FeatureFlagContext);
  
  if (context === undefined) {
    // Return a default implementation instead of throwing an error
    return {
      isLoading: false,
      error: null,
      featureFlags: {},
      isFeatureEnabled: () => true, // Default to enabling features if context fails
      currentEnvironment: 'production' as AppEnvironment,
      retryLoading: () => {}
    };
  }
  
  return context;
};

// Feature toggle component that conditionally renders content
export const FeatureToggle = ({ 
  featureKey, 
  children, 
  fallback = null 
}: { 
  featureKey: string; 
  children: ReactNode; 
  fallback?: ReactNode 
}) => {
  const { isFeatureEnabled, error, retryLoading } = useFeatureFlagContext();
  
  // If there's an error loading flags, but the feature key is critical, 
  // show the feature with an error notice
  if (error) {
    return (
      <>
        {children}
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Feature flag service unavailable. Some features may not work correctly.</span>
            <button 
              onClick={retryLoading} 
              className="bg-destructive/20 px-2 py-1 rounded-sm text-xs"
            >
              Retry
            </button>
          </AlertDescription>
        </Alert>
      </>
    );
  }
  
  return isFeatureEnabled(featureKey) ? <>{children}</> : <>{fallback}</>;
};
