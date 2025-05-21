
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
      
      // First, find a user with the provided email
      const { data: authUser, error: authError } = await supabase.auth
        .admin.getUserByEmail(email);
        
      if (authError || !authUser) {
        console.error('Error checking user existence:', authError || 'User not found');
        return { userExists: false, hasActiveMembership: false, userId: null };
      }
      
      // Check if the user has a user role
      const { data: userData, error: userError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('user_id', authUser.id)
        .eq('role', 'user')
        .maybeSingle();

      // If no user role found, return early
      if (userError || !userData) {
        console.error('Error checking user role:', userError || 'User role not found');
        return { userExists: false, hasActiveMembership: false, userId: null };
      }

      // Check if user has an active membership
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select(`
          id,
          status,
          renewal_at,
          product_id
        `)
        .eq('user_id', userData.user_id)
        .eq('status', 'active')
        .maybeSingle();

      if (membershipError) {
        console.error('Error checking membership status:', membershipError);
        throw new Error('Failed to verify membership status');
      }

      // Check if membership is active and not expired
      const hasActiveMembership = !!membership && 
        membership.status === 'active' && 
        (!membership.renewal_at || new Date(membership.renewal_at) > new Date());
      
      // If we have a membership, fetch the product info separately
      let productInfo = null;
      if (membership && hasActiveMembership && membership.product_id) {
        const { data: productData } = await supabase
          .from('products')
          .select('name, description')
          .eq('id', membership.product_id)
          .single();
          
        if (productData) {
          productInfo = {
            name: productData.name,
            description: productData.description
          };
        }
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
