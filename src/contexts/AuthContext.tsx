import { useState, useEffect, createContext } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  authInitialized: boolean;
  handleLogout: () => Promise<void>;
  handleLogin: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any, data?: any }>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isLoading: true,
  isAdmin: false,
  authInitialized: false,
  handleLogout: async () => {},
  handleLogin: async () => ({ success: false }),
  signUp: async () => ({ error: null }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", _event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        setTimeout(() => {
          if (mounted) {
            setLoading(false);
            setIsLoading(false);
          }
        }, 500);

        if (currentSession?.user) {
          checkAdminStatus(currentSession.user.id);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!mounted) return;

      console.log("Initial session check:", currentSession);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      setIsLoading(false);

      if (currentSession?.user) {
        checkAdminStatus(currentSession.user.id);
      }
    }).catch(error => {
      console.error("Error checking session:", error);
      if (mounted) {
        setLoading(false);
        setIsLoading(false);
      }
    });

    const loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.log("Safety timeout triggered - forcing loading state to end");
        setLoading(false);
        setIsLoading(false);
      }
    }, 3000);

    return () => {
      console.log("Cleaning up auth state listener...");
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(!!data);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("Login attempt for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Login error:", error.message);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected login error:", error);
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      return { data, error };
    } catch (error) {
      return { error };
    }
  };

  const handleLogout = async () => {
    console.log("Logging out...");
    await supabase.auth.signOut();
    console.log("Logged out successfully");
  };

  const authInitialized = !loading && !isLoading;

  const value = {
    user,
    session,
    loading,
    isLoading,
    isAdmin,
    handleLogout,
    handleLogin,
    signUp,
    authInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
