
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FeatureFlag } from '@/hooks/useFeatureFlags';
import { User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserFeatureTarget {
  id: string;
  user_id: string;
  feature_id: string;
  is_enabled: boolean;
  email?: string;
}

interface UserSearchResult {
  id: string;
  email: string;
}

interface UserTargetingDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  feature: FeatureFlag | null;
  userTargets: UserFeatureTarget[];
  onUserTargetsChange: () => void;
}

const UserTargetingDialog = ({ 
  open, 
  setOpen, 
  feature, 
  userTargets,
  onUserTargetsChange
}: UserTargetingDialogProps) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);

  const searchUsersByEmail = async (email: string) => {
    try {
      if (!email || email.length < 3) {
        setUserSearchResults([]);
        return;
      }

      // In a real app, you'd have a secure way to search users
      // For now, we'll use demo data for UI testing
      setUserSearchResults([
        { id: 'demo-user-1', email: 'demo1@example.com' },
        { id: 'demo-user-2', email: 'demo2@example.com' }
      ]);
    } catch (err: any) {
      console.error('Error searching users:', err);
      toast({
        title: 'Failed to search users',
        description: err.message || 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const addUserTargeting = async (userId: string, featureId: string, isEnabled: boolean) => {
    if (!feature) return;
    
    try {
      setIsUpdating(true);

      // Use the set_user_feature_targeting RPC function
      const { data, error } = await supabase
        .rpc('set_user_feature_targeting', {
          user_uuid: userId,
          feature_uuid: featureId,
          enabled: isEnabled
        });
        
      if (error) throw error;

      toast({
        title: 'User targeting updated',
        description: `Feature has been ${isEnabled ? 'enabled' : 'disabled'} for user`,
      });

      // Refresh the data
      onUserTargetsChange();
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

      // Use the remove_user_feature_targeting RPC function
      const { data, error } = await supabase
        .rpc('remove_user_feature_targeting', {
          target_uuid: targetId
        });

      if (error) throw error;

      toast({
        title: 'User targeting removed',
        description: 'The user will now use the default feature setting',
      });
      
      // Update parent component
      onUserTargetsChange();
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

  if (!feature) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Targeting for {feature.display_name}</DialogTitle>
          <DialogDescription>
            Override the environment setting for specific users
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
                        onClick={() => addUserTargeting(user.id, feature.id, true)}
                        disabled={isUpdating}
                      >
                        Enable
                      </Button>
                      <Button
                        size="sm" 
                        variant="outline"
                        onClick={() => addUserTargeting(user.id, feature.id, false)}
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
          
          {userTargets.filter(t => t.feature_id === feature.id).length > 0 && (
            <div className="border rounded-md p-2">
              <h4 className="text-sm font-semibold mb-2">Current Overrides</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {userTargets
                  .filter(t => t.feature_id === feature.id)
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
            setOpen(false);
          }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserTargetingDialog;
