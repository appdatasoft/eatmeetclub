
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Create a simple in-memory cache for admin status
const adminStatusCache = new Map<string, boolean>();

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);
  const { user } = useAuth();

  // Memoized admin check function to prevent recreating on each render
  const checkAdminStatus = useCallback(async (userId: string) => {
    // Check cache first
    if (adminStatusCache.has(userId)) {
      return adminStatusCache.get(userId);
    }
    
    try {
      const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Cache the result for 5 minutes
      adminStatusCache.set(userId, !!data);
      
      // Set up a timeout to invalidate the cache
      setTimeout(() => {
        adminStatusCache.delete(userId);
      }, 5 * 60 * 1000); // 5 minutes
      
      return !!data;
    } catch (err) {
      console.error('Error checking admin status:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    let timeoutId: number;
    
    // Set a shorter timeout for better user experience
    timeoutId = window.setTimeout(() => {
      if (isMounted) {
        setAuthCheckTimedOut(true);
        setIsLoading(false);
        setError("Verification timed out. Please try again.");
      }
    }, 2000); // Reduced timeout to 2 seconds
    
    const verifyAdminAccess = async () => {
      if (!isMounted) return;
      
      try {
        if (!user) {
          // Store the current path for redirect after login
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
          return;
        }
        
        // Check admin status with optimized function
        const isUserAdmin = await checkAdminStatus(user.id);
        
        if (!isUserAdmin) {
          toast({
            title: "Access denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        if (isMounted) {
          setIsAdmin(true);
          setIsLoading(false);
        }
      } catch (error: any) {
        if (isMounted) {
          setError(error.message || "Failed to verify admin status");
          setIsLoading(false);
          toast({
            title: "Error",
            description: error.message || "Failed to verify admin status",
            variant: "destructive"
          });
        }
      }
    };
    
    verifyAdminAccess();
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate, toast, location.pathname, user, checkAdminStatus]);

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
