
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection, resetConnectionCache } from '@/integrations/supabase/utils/connectionUtils';

// Create a persistent cache with longer expiration
const adminStatusCache = new Map<string, {
  isAdmin: boolean;
  timestamp: number;
}>();

// Cache duration set to 5 minutes (300000ms)
const CACHE_DURATION = 300000; 
// Timeout for admin check - 4 seconds for better user experience while still allowing time for connection
const AUTH_CHECK_TIMEOUT = 4000;
// Maximum retries for connection issues
const MAX_RETRIES = 3;

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const { user } = useAuth();
  
  // Add refs to track component mount state and pending operations
  const isMounted = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  const connectionCheckedRef = useRef(false);
  const retryCountRef = useRef(0);

  // Check if admin status is cached and valid
  const getFromCache = useCallback((userId: string) => {
    const cached = adminStatusCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached admin status');
      return cached.isAdmin;
    }
    return null;
  }, []);

  // Update cache with new admin status
  const updateCache = useCallback((userId: string, isAdmin: boolean) => {
    adminStatusCache.set(userId, {
      isAdmin,
      timestamp: Date.now()
    });
  }, []);

  // Optimized admin check function to minimize database calls
  const checkAdminStatus = useCallback(async (userId: string, forceConnectionCheck = false) => {
    // Try from cache first (unless we're doing a forced check after retries)
    if (!forceConnectionCheck) {
      const cachedStatus = getFromCache(userId);
      if (cachedStatus !== null) {
        return cachedStatus;
      }
    }
    
    console.log('Checking admin status from database');
    try {
      // First ensure connection is working
      const isConnected = await checkSupabaseConnection(forceConnectionCheck);
      connectionCheckedRef.current = true;
      
      if (!isConnected) {
        throw new Error("Unable to connect to database. Please check your connection.");
      }
      
      // Proceed with admin check
      const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Cache the result
      updateCache(userId, !!data);
      
      return !!data;
    } catch (err) {
      console.error('Error checking admin status:', err);
      throw err;
    }
  }, [getFromCache, updateCache]);

  useEffect(() => {
    // Set isMounted to true and reset on cleanup
    isMounted.current = true;
    retryCountRef.current = 0;
    
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Set a timeout for better user experience
    timeoutRef.current = window.setTimeout(() => {
      if (isMounted.current && isLoading) {
        setAuthCheckTimedOut(true);
        setIsLoading(false);
        console.log("Admin access verification timed out");
      }
    }, AUTH_CHECK_TIMEOUT);
    
    const verifyAdminAccess = async () => {
      if (!isMounted.current) return;
      
      // Reset states at the beginning
      setAuthCheckTimedOut(false);
      
      try {
        if (!user) {
          // Store the current path for redirect after login
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
          return;
        }
        
        console.log('Verifying admin status for:', user.id);
        // Check admin status with optimized function
        const isUserAdmin = await checkAdminStatus(user.id);
        
        if (!isUserAdmin) {
          console.log('Access denied: Not an admin');
          toast({
            title: "Access denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        if (isMounted.current) {
          console.log('Admin access verified');
          setIsAdmin(true);
          setIsLoading(false);
          // Clear timeout as we've completed successfully
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      } catch (error: any) {
        if (isMounted.current) {
          console.error('Admin verification error:', error);
          setError(error.message || "Failed to verify admin status");
          setIsLoading(false);
          // Don't show repeated toast messages for connection errors
          // as they can become annoying when there are multiple retries
          if (!error.message?.includes('connect to database')) {
            toast({
              title: "Error",
              description: error.message || "Failed to verify admin status",
              variant: "destructive"
            });
          }
          // Clear timeout since we've handled the error
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    };
    
    verifyAdminAccess();
    
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [navigate, toast, location.pathname, user, checkAdminStatus]);

  const handleRetry = useCallback(() => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);
    setAuthCheckTimedOut(false);
    retryCountRef.current += 1;
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    // If using cache and failed, clear cache for this user and reset connection cache
    if (user) {
      adminStatusCache.delete(user.id);
    }
    
    // Reset connection check flag and connection cache to force a fresh check
    connectionCheckedRef.current = false;
    if (retryCountRef.current > 1) {
      resetConnectionCache();
    }
    
    // Set a new timeout for the retry
    const retryTimeout = Math.min(AUTH_CHECK_TIMEOUT + (retryCountRef.current * 1000), 8000);
    timeoutRef.current = window.setTimeout(() => {
      if (isMounted.current) {
        setAuthCheckTimedOut(true);
        setIsLoading(false);
        setIsRetrying(false);
        console.log(`Retry admin access verification timed out after ${retryTimeout}ms`);
      }
    }, retryTimeout);
    
    // Try verification again
    const verifyAdminAccess = async () => {
      try {
        if (!user) {
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
          return;
        }
        
        console.log('Retrying admin verification for:', user.id);
        
        // Force connection check on retry attempts
        const isUserAdmin = await checkAdminStatus(user.id, true);
        
        if (!isUserAdmin) {
          console.log('Access denied on retry: Not an admin');
          toast({
            title: "Access denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        if (isMounted.current) {
          console.log('Admin access verified on retry');
          setIsAdmin(true);
          setIsLoading(false);
          setIsRetrying(false);
          // Clear timeout as we've completed successfully
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      } catch (error: any) {
        if (isMounted.current) {
          console.error('Admin verification retry error:', error);
          setError(error.message || "Failed to verify admin status");
          setIsLoading(false);
          setIsRetrying(false);
          // Only show toast for non-connection errors to avoid notification spam
          if (!error.message?.includes('connect to database')) {
            toast({
              title: "Error",
              description: error.message || "Failed to verify admin status",
              variant: "destructive"
            });
          }
          // Clear timeout since we've handled the error
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        }
      }
    };
    
    verifyAdminAccess();
  }, [user, navigate, location.pathname, toast, checkAdminStatus, isRetrying]);

  return {
    isAdmin,
    isLoading,
    error,
    authCheckTimedOut,
    isRetrying,
    handleRetry
  };
};

export default useAdminAuth;
