
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminStatus = useCallback(async (userId: string) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc(
        'is_admin',
        { user_id: userId }
      );
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    console.log('Setting up auth state listener...');
    
    // Set initial loading state
    setIsLoading(true);
    
    // Get the initial session first
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('Initial auth session:', data?.session?.user?.id);
        
        if (data?.session?.user) {
          setUser(data.session.user);
          // Use setTimeout to prevent deadlocks with Supabase auth state changes
          setTimeout(() => {
            if (mounted) checkAdminStatus(data.session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    // Then set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;
        
        if (session?.user) {
          setUser(session.user);
          // Use setTimeout to prevent deadlocks with Supabase auth state changes
          setTimeout(() => {
            if (mounted) checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );
    
    getInitialSession();
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
      setIsLoading(true);
      // First clear any stored redirect paths
      localStorage.removeItem('redirectAfterLogin');
      localStorage.removeItem('pendingTicketPurchase');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log('Logout successful');
      setUser(null);
      setIsAdmin(false);
    } catch (error: any) {
      console.error('Error during logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting to login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      console.log('Login successful:', data);
      return { success: true, data };
    } catch (error: any) {
      console.error('Error logging in:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isAdmin, isLoading, handleLogout, handleLogin };
};

export default useAuth;
