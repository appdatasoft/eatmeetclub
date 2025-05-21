
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FeatureFlag, FeatureFlagValue, AppEnvironment } from '@/hooks/useFeatureFlags';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info, RefreshCw } from 'lucide-react';
import UserTargetingDialog from './feature-flags/UserTargetingDialog';
import EnvironmentTabContent from './feature-flags/EnvironmentTabContent';

interface UserFeatureTarget {
  id: string;
  user_id: string;
  feature_id: string;
  is_enabled: boolean;
  email?: string;
}

export const FeatureFlagManager = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [flagValues, setFlagValues] = useState<FeatureFlagValue[]>([]);
  const [userTargets, setUserTargets] = useState<UserFeatureTarget[]>([]);
  const [currentEnv, setCurrentEnv] = useState<AppEnvironment>('production');
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);
  const [userTargetingOpen, setUserTargetingOpen] = useState(false);

  const fetchFeatureFlags = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch feature flags
      const { data: flags, error: flagsError } = await supabase
        .from('feature_flags')
        .select('*')
        .order('display_name');

      if (flagsError) throw flagsError;

      // Fetch feature flag values for all environments
      const { data: values, error: valuesError } = await supabase
        .from('feature_flag_values')
        .select('*');

      if (valuesError) throw valuesError;

      // Fetch user feature targeting data
      const { data: targets, error: targetsError } = await supabase
        .from('user_feature_targeting')
        .select('*');

      if (targetsError) {
        console.error('Error fetching user targeting:', targetsError);
        // We still continue with the flags and values
      } else if (targets) {
        setUserTargets(targets);
      }

      setFeatureFlags(flags || []);
      setFlagValues(values || []);
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

  const handleToggleFeature = async (featureId: string, environment: AppEnvironment, isEnabled: boolean) => {
    try {
      setIsUpdating(true);
      
      // Find the flag value to update
      const flagValue = flagValues.find(
        v => v.feature_id === featureId && v.environment === environment
      );

      if (!flagValue) {
        throw new Error('Feature flag value not found');
      }

      // Update in Supabase
      const { error } = await supabase
        .from('feature_flag_values')
        .update({ is_enabled: isEnabled })
        .eq('id', flagValue.id);

      if (error) throw error;

      // Update local state
      setFlagValues(prev => 
        prev.map(v => v.id === flagValue.id ? { ...v, is_enabled: isEnabled } : v)
      );

      toast({
        title: 'Feature flag updated',
        description: `Feature "${featureFlags.find(f => f.id === featureId)?.display_name}" has been ${isEnabled ? 'enabled' : 'disabled'} for ${environment}`,
      });
    } catch (err: any) {
      console.error('Error updating feature flag:', err);
      toast({
        title: 'Failed to update feature flag',
        description: err.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenUserTargeting = (flag: FeatureFlag) => {
    setSelectedFeature(flag);
    setUserTargetingOpen(true);
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchFeatureFlags();
    }
  }, [user, isAdmin]);

  if (!isAdmin) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to manage feature flags.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Loading feature flags...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading feature flags: {error.message}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={fetchFeatureFlags}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Feature Flag Management</h1>
        <Button onClick={fetchFeatureFlags} variant="outline" disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure which features are enabled in each environment. Changes take effect immediately.
        </AlertDescription>
      </Alert>

      <Tabs value={currentEnv} onValueChange={(val) => setCurrentEnv(val as AppEnvironment)}>
        <TabsList className="mb-4">
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="staging">Staging</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>

        {(['development', 'staging', 'production'] as AppEnvironment[]).map((env) => (
          <EnvironmentTabContent
            key={env}
            environment={env}
            featureFlags={featureFlags}
            flagValues={flagValues}
            isUpdating={isUpdating}
            onToggleFeature={handleToggleFeature}
            onOpenUserTargeting={handleOpenUserTargeting}
          />
        ))}
      </Tabs>

      <UserTargetingDialog
        open={userTargetingOpen}
        setOpen={setUserTargetingOpen}
        feature={selectedFeature}
        userTargets={userTargets}
        onUserTargetsChange={fetchFeatureFlags}
      />
    </div>
  );
};

export default FeatureFlagManager;
