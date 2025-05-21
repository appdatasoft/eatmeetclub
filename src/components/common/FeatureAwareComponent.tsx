
import React from 'react';
import { FeatureToggle } from '@/contexts/FeatureFlagContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface FeatureAwareComponentProps {
  featureKey: string;
  children: React.ReactNode;
  fallbackMessage?: string;
}

export const FeatureAwareComponent = ({ 
  featureKey, 
  children, 
  fallbackMessage = 'This feature is not currently available.' 
}: FeatureAwareComponentProps) => {
  return (
    <FeatureToggle
      featureKey={featureKey}
      fallback={
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{fallbackMessage}</AlertDescription>
        </Alert>
      }
    >
      {children}
    </FeatureToggle>
  );
};
