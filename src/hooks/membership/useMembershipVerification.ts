
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
      
      // Query user table directly rather than using RPC
      // Note: We need to check if a user with this email exists in auth.users
      const { data: userData, error: userError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'user')
        .single();

      if (userError) {
        console.error('Error checking user existence:', userError);
        return { userExists: false, hasActiveMembership: false, userId: null };
      }

      // If no user found, return early
      if (!userData) {
        return { userExists: false, hasActiveMembership: false, userId: null };
      }

      // Check if user has an active membership
      const { data: memberships, error: membershipError } = await supabase
        .from('memberships')
        .select(`
          id,
          status,
          renewal_at,
          products:products (
            name,
            description
          )
        `)
        .eq('user_id', userData.user_id)
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

      // Handle products relationship properly
      let productInfo = null;
      if (memberships && memberships.products) {
        productInfo = {
          name: memberships.products.name,
          description: memberships.products.description
        };
      }

      return { 
        userExists: true, 
        hasActiveMembership: hasActiveMembership,
        userId: userData.user_id,
        productInfo: productInfo
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
