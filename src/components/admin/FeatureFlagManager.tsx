
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FeatureFlag, FeatureFlagValue, AppEnvironment } from '@/hooks/useFeatureFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Info, RefreshCw, Users, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  const [emailInput, setEmailInput] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | null>(null);

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

      // Fetch user feature targeting using direct query
      try {
        const { data: targetsData, error: targetsError } = await supabase
          .from('user_feature_targeting')
          .select('*');

        if (targetsError) {
          console.error('Error fetching user targeting:', targetsError);
        } else if (targetsData) {
          // Cast to expected type
          setUserTargets(targetsData as unknown as UserFeatureTarget[]);
        }
      } catch (targetError) {
        console.error('Error processing user targeting data:', targetError);
        // Continue with the flags and values, even if user targeting fails
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

  const searchUsersByEmail = async (email: string) => {
    try {
      if (!email || email.length < 3) {
        setUserSearchResults([]);
        return;
      }

      // Call the built-in RPC function to get users as an admin
      const { data, error } = await supabase.rpc('get_users_for_admin');

      if (error) throw error;

      // Filter the results client-side
      const filteredUsers = data.filter((u: any) => 
        u.email && u.email.toLowerCase().includes(email.toLowerCase())
      ).slice(0, 5);
      
      setUserSearchResults(filteredUsers);
    } catch (err: any) {
      console.error('Error searching users:', err);
      toast({
        title: 'Failed to search users',
        description: err.message || 'Please try again later',
        variant: 'destructive',
      });
      setUserSearchResults([]);
    }
  };

  const addUserTargeting = async (userId: string, featureId: string, isEnabled: boolean) => {
    try {
      setIsUpdating(true);

      // Use direct insert/update instead of RPC function
      const { data: existingData, error: checkError } = await supabase
        .from('user_feature_targeting')
        .select('id')
        .eq('user_id', userId)
        .eq('feature_id', featureId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingData) {
        // Update existing record
        result = await supabase
          .from('user_feature_targeting')
          .update({ is_enabled: isEnabled, updated_at: new Date().toISOString() })
          .eq('id', existingData.id);
      } else {
        // Insert new record
        result = await supabase
          .from('user_feature_targeting')
          .insert({ 
            user_id: userId, 
            feature_id: featureId, 
            is_enabled: isEnabled 
          });
      }

      if (result.error) throw result.error;

      toast({
        title: 'User targeting updated',
        description: `Feature has been ${isEnabled ? 'enabled' : 'disabled'} for user`,
      });

      // Refresh the data
      fetchFeatureFlags();
    } catch (err: any) {
      console.error('Error updating user targeting:', err);
      toast({
        title: 'Failed to update user targeting',
        description: err.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setEmailInput('');
      setUserSearchResults([]);
    }
  };

  const removeUserTargeting = async (targetId: string) => {
    try {
      setIsUpdating(true);

      // Use direct delete instead of RPC function
      const { error } = await supabase
        .from('user_feature_targeting')
        .delete()
        .eq('id', targetId);

      if (error) throw error;

      // Update local state
      setUserTargets(prev => prev.filter(t => t.id !== targetId));

      toast({
        title: 'User targeting removed',
        description: 'The user will now use the default feature setting',
      });
    } catch (err: any) {
      console.error('Error removing user targeting:', err);
      toast({
        title: 'Failed to remove user targeting',
        description: err.message || 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchFeatureFlags();
    }
  }, [user, isAdmin]);

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
          <TabsContent key={env} value={env} className="space-y-4">
            {featureFlags.map((flag) => {
              const flagValue = flagValues.find(
                v => v.feature_id === flag.id && v.environment === env
              );
              
              const isEnabled = flagValue?.is_enabled || false;
              
              return (
                <Card key={flag.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{flag.display_name}</CardTitle>
                    <CardDescription>{flag.description || `Key: ${flag.feature_key}`}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${flag.id}-${env}`} className="flex-1">
                        Enable for {env}
                      </Label>
                      <Switch
                        id={`${flag.id}-${env}`}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggleFeature(flag.id, env, checked)}
                        disabled={isUpdating}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="pb-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSelectedFeature(flag)}
                        >
                          <Users className="mr-2 h-4 w-4" /> Manage User Targeting
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>User Targeting for {flag.display_name}</DialogTitle>
                          <DialogDescription>
                            Override the {env} environment setting for specific users
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 my-4">
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="Search user by email"
                              value={emailInput}
                              onChange={(e) => {
                                setEmailInput(e.target.value);
                                searchUsersByEmail(e.target.value);
                              }}
                            />
                          </div>
                          
                          {userSearchResults.length > 0 && (
                            <div className="border rounded-md p-2">
                              <h4 className="text-sm font-semibold mb-2">Search Results</h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {userSearchResults.map(user => (
                                  <div key={user.id} className="flex items-center justify-between border-b pb-2">
                                    <div className="flex items-center">
                                      <User className="h-4 w-4 mr-2" />
                                      <span>{user.email}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => addUserTargeting(user.id, flag.id, true)}
                                        disabled={isUpdating}
                                      >
                                        Enable
                                      </Button>
                                      <Button
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => addUserTargeting(user.id, flag.id, false)}
                                        disabled={isUpdating}
                                      >
                                        Disable
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {userTargets.filter(t => t.feature_id === flag.id).length > 0 && (
                            <div className="border rounded-md p-2">
                              <h4 className="text-sm font-semibold mb-2">Current Overrides</h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {userTargets
                                  .filter(t => t.feature_id === flag.id)
                                  .map(target => {
                                    // Find user email from search results if available
                                    const targetUser = userSearchResults.find(u => u.id === target.user_id);
                                    return (
                                      <div key={target.id} className="flex items-center justify-between border-b pb-2">
                                        <div className="flex items-center">
                                          <User className="h-4 w-4 mr-2" />
                                          <span>
                                            {targetUser?.email || target.user_id.substring(0, 8)}
                                            {target.is_enabled ? ' (Enabled)' : ' (Disabled)'}
                                          </span>
                                        </div>
                                        <Button 
                                          size="sm" 
                                          variant="destructive"
                                          onClick={() => removeUserTargeting(target.id)}
                                          disabled={isUpdating}
                                        >
                                          Remove
                                        </Button>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {
                            setEmailInput('');
                            setUserSearchResults([]);
                          }}>
                            Close
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

