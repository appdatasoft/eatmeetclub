
import React from 'react';
import { AppEnvironment, FeatureFlag, FeatureFlagValue } from '@/hooks/useFeatureFlags';
import { TabsContent } from '@/components/ui/tabs';
import FeatureFlagCard from './FeatureFlagCard';

interface EnvironmentTabContentProps {
  environment: AppEnvironment;
  featureFlags: FeatureFlag[];
  flagValues: FeatureFlagValue[];
  isUpdating: boolean;
  onToggleFeature: (featureId: string, environment: AppEnvironment, isEnabled: boolean) => Promise<void>;
  onOpenUserTargeting: (flag: FeatureFlag) => void;
}

const EnvironmentTabContent = ({
  environment,
  featureFlags,
  flagValues,
  isUpdating,
  onToggleFeature,
  onOpenUserTargeting
}: EnvironmentTabContentProps) => {
  return (
    <TabsContent key={environment} value={environment} className="space-y-4">
      {featureFlags.map((flag) => {
        const flagValue = flagValues.find(
          v => v.feature_id === flag.id && v.environment === environment
        );
        
        return (
          <FeatureFlagCard
            key={flag.id}
            flag={flag}
            environment={environment}
            flagValue={flagValue}
            isUpdating={isUpdating}
            onToggleFeature={onToggleFeature}
            onOpenUserTargeting={onOpenUserTargeting}
          />
        );
      })}
    </TabsContent>
  );
};

export default EnvironmentTabContent;
