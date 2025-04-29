
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
    // Set up the auth state listener first to avoid missing events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setUser(session?.user || null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );
    
    // Then get the initial session
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log('Initial auth session:', data.session?.user?.id);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          await checkAdminStatus(data.session.user.id);
        }
      } catch (error) {
        console.error('Error fetching initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  return { user, isAdmin, isLoading };
};

export default useAuth;
