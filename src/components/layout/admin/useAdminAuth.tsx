
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (!user) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Authentication required",
            description: "You need to be logged in to access the admin area",
            variant: "destructive"
          });
          // Store the current path for redirect after login
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
          return;
        }
        
        // Check if user is admin with safer implementation
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (error) {
          console.error("Admin check error:", error);
          throw new Error(error.message);
        }
        
        if (!data) {
          console.log("User is not an admin, redirecting to dashboard");
          toast({
            title: "Access denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        if (isMounted) {
          console.log("Admin check passed, allowing access");
          setIsAdmin(true);
        }
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        if (isMounted) {
          setError(error.message || "Failed to verify admin status");
          toast({
            title: "Error",
            description: error.message || "Failed to verify admin status",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Admin check timed out");
        setAuthCheckTimedOut(true);
        setIsLoading(false);
        setError("Verification timed out. Please refresh the page or try again later.");
      }
    }, 3000); // Reduced from 5 to 3 seconds for faster feedback
    
    checkAdminStatus();
    
    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate, toast, location.pathname, user]);

  const handleRetry = () => {
    window.location.reload();
  };

  return {
    isAdmin,
    isLoading,
    error,
    authCheckTimedOut,
    handleRetry
  };
};

export default useAdminAuth;
