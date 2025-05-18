import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { LoginForm } from '@/components/auth/LoginForm';
import { LoginSkeleton } from '@/components/auth/LoginSkeleton';
import { useConnectionCheck } from '@/components/auth/ConnectionCheck';
import { useRedirectPath } from '@/hooks/useRedirectPath';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { handleLogin, session, isLoading } = useAuth();
  const getRedirectPath = useRedirectPath();
  const { connectionChecking, connectionOk } = useConnectionCheck();

  // Check for stored email from previous flows
  useEffect(() => {
    const storedEmail = localStorage.getItem('loginEmail');
    if (storedEmail) {
      // We would use this in LoginForm, but for simplicity keeping the refactoring minimal
      localStorage.removeItem('loginEmail');
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    const redirectIfLoggedIn = () => {
      if (!isLoading && session) {
        const redirectPath = getRedirectPath();
        console.log("Already logged in, redirecting to:", redirectPath);
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      }
    };

    // Check immediately and also after a timeout to ensure we catch late session changes
    redirectIfLoggedIn();
    const timeoutId = setTimeout(redirectIfLoggedIn, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [session, navigate, isLoading, getRedirectPath]);

  const handleSubmit = async (email: string, password: string) => {
    setLoading(true);
    console.log("Attempting login for:", email);
    
    try {
      const { success, error } = await handleLogin(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Get redirect path
        const redirectPath = getRedirectPath();
        console.log("Login successful, redirecting to:", redirectPath);
        
        // Clear stored path
        localStorage.removeItem('redirectAfterLogin');
        
        // Navigate to redirect path
        navigate(redirectPath);
      } else {
        console.error("Login failed:", error);
        toast({
          title: "Login failed",
          description: error?.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show a more compact loading state that doesn't fill the entire screen
  const renderContent = () => {
    if (isLoading) {
      return <LoginSkeleton />;
    }

    // Simplified connection checking UI - don't block the form rendering
    if (connectionChecking) {
      console.log("Still checking connection, but showing the form anyway");
    }

    return (
      <div className="w-full max-w-md">
        <LoginForm 
          connectionOk={connectionOk}
          onSubmit={handleSubmit}
        />
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 px-4 py-12">
        {renderContent()}
      </div>
    </MainLayout>
  );
};

export default Login;
