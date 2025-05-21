
import React, { createContext, ReactNode, useContext } from 'react';
import { useFeatureFlags, AppEnvironment } from '@/hooks/useFeatureFlags';

interface FeatureFlagContextType {
  isLoading: boolean;
  error: Error | null;
  featureFlags: Record<string, boolean>;
  isFeatureEnabled: (featureKey: string) => boolean;
  currentEnvironment: AppEnvironment;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const featureFlagState = useFeatureFlags();
  
  return (
    <FeatureFlagContext.Provider value={featureFlagState}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export const useFeatureFlagContext = () => {
  const context = useContext(FeatureFlagContext);
  
  if (context === undefined) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
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
  const { isFeatureEnabled } = useFeatureFlagContext();
  
  return isFeatureEnabled(featureKey) ? <>{children}</> : <>{fallback}</>;
};
