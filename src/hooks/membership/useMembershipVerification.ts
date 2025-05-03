
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMembershipStatus } from '@/hooks/useMembershipStatus';

export const useMembershipVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshMembership } = useMembershipStatus();

  const verifyEmailAndMembershipStatus = async (email: string): Promise<{ 
    userExists: boolean; 
    hasActiveMembership: boolean;
    userId: string | null;
  }> => {
    try {
      setIsVerifying(true);

      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Get all users from Auth to check if email exists
      const { data, error } = await supabase.functions.invoke('check-membership-status', {
        body: { email },
        headers: {
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
          'expires': '0'
        }
      });

      if (error) {
        console.error('Error checking user existence:', error);
        throw new Error('Failed to verify user status');
      }

      // If no users with that email, then user doesn't exist
      if (!data.users || data.users.length === 0) {
        return { userExists: false, hasActiveMembership: false, userId: null };
      }

      // User exists, now check if they have an active membership
      const userId = data.users[0].id;
      const { data: membershipData, error: membershipError } = await supabase.functions.invoke('check-membership-status', {
        body: { userId },
        headers: {
          'cache-control': 'no-cache',
          'pragma': 'no-cache',
          'expires': '0'
        }
      });

      if (membershipError) {
        console.error('Error checking membership status:', membershipError);
        throw new Error('Failed to verify membership status');
      }

      return { 
        userExists: true, 
        hasActiveMembership: membershipData?.hasActiveMembership || false,
        userId
      };
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Error",
        description: error.message || "Could not verify account status",
        variant: "destructive",
      });
      return { userExists: false, hasActiveMembership: false, userId: null };
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExistingMember = (email: string) => {
    // Store email in local storage for the login form
    localStorage.setItem('loginEmail', email);
    
    // Navigate to login with a message
    toast({
      title: "Active Membership Exists",
      description: "You already have an active membership. Please log in to access your account.",
      duration: 5000,
    });
    
    navigate('/login');
  };

  return {
    isVerifying,
    verifyEmailAndMembershipStatus,
    handleExistingMember
  };
};

export default useMembershipVerification;
