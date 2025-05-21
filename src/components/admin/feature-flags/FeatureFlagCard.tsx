
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { FeatureFlag, FeatureFlagValue, AppEnvironment } from '@/hooks/useFeatureFlags';

interface FeatureFlagCardProps {
  flag: FeatureFlag;
  environment: AppEnvironment;
  flagValue: FeatureFlagValue | undefined;
  isUpdating: boolean;
  onToggleFeature: (featureId: string, environment: AppEnvironment, isEnabled: boolean) => Promise<void>;
  onOpenUserTargeting: (flag: FeatureFlag) => void;
}

const FeatureFlagCard = ({
  flag,
  environment,
  flagValue,
  isUpdating,
  onToggleFeature,
  onOpenUserTargeting
}: FeatureFlagCardProps) => {
  const isEnabled = flagValue?.is_enabled || false;
  
  return (
    <Card key={flag.id}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{flag.display_name}</CardTitle>
        <CardDescription>{flag.description || `Key: ${flag.feature_key}`}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor={`${flag.id}-${environment}`} className="flex-1">
            Enable for {environment}
          </Label>
          <Switch
            id={`${flag.id}-${environment}`}
            checked={isEnabled}
            onCheckedChange={(checked) => onToggleFeature(flag.id, environment, checked)}
            disabled={isUpdating}
          />
        </div>
      </CardContent>
      <CardFooter className="pb-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onOpenUserTargeting(flag)}
        >
          <Users className="mr-2 h-4 w-4" /> Manage User Targeting
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeatureFlagCard;
