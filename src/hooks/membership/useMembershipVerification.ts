
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
    productInfo?: { name?: string; description?: string; } | null;
  }> => {
    try {
      setIsVerifying(true);
      
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Check if user exists - using the auth.users query instead of profiles
      const { data: authUser, error: authError } = await supabase.auth.admin
        .listUsers({
          filters: {
            email: email
          }
        });

      if (authError) {
        console.error('Error checking user existence:', authError);
        return { userExists: false, hasActiveMembership: false, userId: null };
      }

      // If no user found, return early
      const user = authUser?.users?.[0];
      if (!user) {
        return { userExists: false, hasActiveMembership: false, userId: null };
      }

      // Check if user has an active membership
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select(`
          id,
          status,
          renewal_at,
          product:products (
            name,
            description
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (membershipError) {
        console.error('Error checking membership status:', membershipError);
        throw new Error('Failed to verify membership status');
      }

      // Check if membership is active and not expired
      const hasActiveMembership = !!memberships && 
        memberships.status === 'active' && 
        (!memberships.renewal_at || new Date(memberships.renewal_at) > new Date());

      return { 
        userExists: true, 
        hasActiveMembership: hasActiveMembership,
        userId: user.id,
        productInfo: memberships?.product || null
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

  const handleExistingMember = (email: string, productInfo?: { name?: string; description?: string; } | null) => {
    // Store email in local storage for the login form
    localStorage.setItem('loginEmail', email);
    
    // Navigate to login with a message
    toast({
      title: "Active Membership Exists",
      description: productInfo?.name 
        ? `You already have an active "${productInfo.name}" membership. Please log in to access your account.` 
        : "You already have an active membership. Please log in to access your account.",
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
