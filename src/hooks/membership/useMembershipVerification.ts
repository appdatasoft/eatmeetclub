
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
      
      // Check membership status
      const { data, error } = await supabase.functions.invoke('check-membership-status', {
        body: { email, timestamp },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (error) {
        console.error('Error checking membership status:', error);
        throw new Error('Failed to verify membership status');
      }

      // If no users or error, user doesn't exist
      if (data.error || !data.users || data.users.length === 0) {
        return { 
          userExists: false, 
          hasActiveMembership: false, 
          userId: null 
        };
      }

      // Return the membership status
      return { 
        userExists: data.userExists || false, 
        hasActiveMembership: data.active || data.hasActiveMembership || false,
        userId: data.users[0]?.id || null
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
