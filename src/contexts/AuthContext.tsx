
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleLogout: () => Promise<void>; // Added for compatibility
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user || null);
        
        if (currentSession?.user) {
          // Check if user is admin using direct database query
          const { data: adminData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', currentSession.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(!!adminData);
        } else {
          setIsAdmin(false);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    async function loadUserData() {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);

        if (data.session?.user) {
          // Check if user is admin using direct database query
          const { data: adminData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          setIsAdmin(!!adminData);
        }
      } catch (error: any) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Failed to log in",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Signup Error",
        description: error.message || "Failed to sign up",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear any cached data after logout
      setSession(null);
      setUser(null);
      setIsAdmin(false);
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Force page refresh to clear any cached state
      setTimeout(() => window.location.href = '/', 100);
    } catch (error: any) {
      console.error("Error during signOut:", error);
      toast({
        title: "Logout Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Add handleLogout as an alias of signOut for compatibility
  const handleLogout = signOut;

  const value = {
    session,
    user,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
