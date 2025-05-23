import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("ADMIN_DEBUG: AuthProvider initializing");

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('ADMIN_DEBUG: Auth state changed:', event, 'user:', currentSession?.user?.email);

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          setTimeout(async () => {
            try {
              console.log('ADMIN_DEBUG: Checking admin status for:', currentSession.user.email);
              const { data: adminData, error: adminError } = await supabase
                .from('user_roles')
                .select('role')
                .eq('user_id', currentSession.user.id)
                .eq('role', 'admin')
                .maybeSingle();

              if (adminError) console.error('ADMIN_DEBUG: Admin check error:', adminError);
              console.log('ADMIN_DEBUG: Admin check result:', adminData);

              const isAdminNow = adminData?.role === 'admin';
              setIsAdmin(isAdminNow);
              console.log('ADMIN_DEBUG: isAdmin set to:', isAdminNow);
            } catch (error) {
              console.error('ADMIN_DEBUG: Error checking admin status:', error);
              setIsAdmin(false);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else {
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    const loadUserData = async () => {
      try {
        console.log('ADMIN_DEBUG: Loading initial user session');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('ADMIN_DEBUG: Error getting session:', error.message);
          setIsLoading(false);
          return;
        }

        console.log('ADMIN_DEBUG: Initial session loaded:', !!data.session, 'user:', data.session?.user?.email);
        setSession(data.session);
        setUser(data.session?.user || null);

        if (data.session?.user) {
          console.log('ADMIN_DEBUG: Checking initial admin status for:', data.session.user.email);
          const { data: adminData, error: adminError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .eq('role', 'admin')
            .maybeSingle();

          if (adminError) console.error('ADMIN_DEBUG: Initial admin check error:', adminError);
          console.log('ADMIN_DEBUG: Initial admin check result:', adminData);

          const isAdminNow = adminData?.role === 'admin';
          setIsAdmin(isAdminNow);
          console.log('ADMIN_DEBUG: Initial isAdmin set to:', isAdminNow);
        }
      } catch (error: any) {
        console.error('ADMIN_DEBUG: Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Attempting to sign in: ${email}`);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login Error",
        description: error.message || "Failed to log in",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account.",
      });
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      console.log("Signing out user");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setSession(null);
      setUser(null);
      setIsAdmin(false);

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error("Error during signOut:", error);
      toast({
        title: "Logout Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = signOut;

  const value = {
    session,
    user,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    handleLogout,
  };

  console.log('[AuthContext.Provider] Exported isAdmin:', isAdmin);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
