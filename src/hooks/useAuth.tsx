
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
    console.log('Setting up auth state listener...');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          await checkAdminStatus(session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );
    
    // Then get the initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await supabase.auth.getSession();
        console.log('Initial auth session:', data?.session?.user?.id);
        
        if (data?.session?.user) {
          setUser(data.session.user);
          await checkAdminStatus(data.session.user.id);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const handleLogout = async () => {
    try {
      console.log('Logging out user...');
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
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
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
    }
  };

  return { user, isAdmin, isLoading, handleLogout, handleLogin };
};

export default useAuth;
