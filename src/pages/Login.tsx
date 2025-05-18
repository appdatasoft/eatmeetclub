
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import { checkSupabaseConnection } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionChecking, setConnectionChecking] = useState(true);
  const [connectionOk, setConnectionOk] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogin, session, isLoading } = useAuth();

  // Test Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionChecking(true);
        const isConnected = await checkSupabaseConnection();
        console.log("Supabase connection check result:", isConnected);
        setConnectionOk(isConnected);
      } catch (error) {
        console.error("Connection check error:", error);
        setConnectionOk(false);
      } finally {
        setConnectionChecking(false);
      }
    };
    
    // Set a timeout to prevent the connection check from hanging
    const connectionTimeout = setTimeout(() => {
      setConnectionChecking(false);
      console.log("Connection check timed out, continuing anyway");
    }, 3000);
    
    checkConnection().finally(() => clearTimeout(connectionTimeout));
    
    // Check for stored email from previous flows
    const storedEmail = localStorage.getItem('loginEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      // Clean up after using it
      localStorage.removeItem('loginEmail');
    }
  }, []);

  // Extract the redirect path from location state or search params
  const getRedirectPath = () => {
    const searchParams = new URLSearchParams(location.search);
    const redirectParam = searchParams.get('redirect');
    
    // Check location state first (from ProtectedRoute)
    const fromPath = location.state?.from;
    
    // Then check localStorage
    const storedPath = localStorage.getItem('redirectAfterLogin');
    
    // Prioritize: redirect param > location state > localStorage > default
    return redirectParam || fromPath || storedPath || '/dashboard';
  };

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
  }, [session, navigate, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

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
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-500">Checking authentication...</p>
          
          {/* Skeleton UI for better UX */}
          <div className="w-full mt-8 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      );
    }

    // Simplified connection checking UI - don't block the form rendering
    if (connectionChecking) {
      console.log("Still checking connection, but showing the form anyway");
    }

    return (
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {!connectionOk && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded p-3 mb-4">
                <p className="text-sm">Connection issue detected. You may experience delays.</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <p>Don't have an account? <a href="/register" className="text-primary hover:underline">Sign up</a></p>
              <p className="mt-2">
                <a href="/forgot-password" className="text-primary hover:underline">Forgot your password?</a>
              </p>
            </div>
          </CardContent>
        </Card>
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
