
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Create a persistent cache with longer expiration
const adminStatusCache = new Map<string, {
  isAdmin: boolean;
  timestamp: number;
}>();

const CACHE_DURATION = 300000; 
const AUTH_CHECK_TIMEOUT = 4000;

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
  
  const isMounted = useRef(true);
  const timeoutRef = useRef<number | null>(null);

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

  // Simplified admin check using only RPC
  const checkAdminStatus = useCallback(async (userId: string, forceCheck = false) => {
    if (!forceCheck) {
      const cachedStatus = getFromCache(userId);
      if (cachedStatus !== null) {
        return cachedStatus;
      }
    }
    
    console.log('Checking admin status via RPC');
    try {
      const { data, error } = await supabase.rpc('is_admin', { user_id: userId });
      
      if (error) {
        throw new Error(error.message);
      }
      
      updateCache(userId, !!data);
      return !!data;
    } catch (err) {
      console.error('Error checking admin status:', err);
      throw err;
    }
  }, [getFromCache, updateCache]);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      if (isMounted.current && isLoading) {
        setAuthCheckTimedOut(true);
        setIsLoading(false);
        console.log("Admin access verification timed out");
      }
    }, AUTH_CHECK_TIMEOUT);
    
    const verifyAdminAccess = async () => {
      if (!isMounted.current) return;
      
      setAuthCheckTimedOut(false);
      
      try {
        if (!user) {
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
          return;
        }
        
        console.log('Verifying admin status for:', user.id);
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
          if (!error.message?.includes('connect to database')) {
            toast({
              title: "Error",
              description: error.message || "Failed to verify admin status",
              variant: "destructive"
            });
          }
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
    
    if (user) {
      adminStatusCache.delete(user.id);
    }
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    const retryTimeout = Math.min(AUTH_CHECK_TIMEOUT + 1000, 8000);
    timeoutRef.current = window.setTimeout(() => {
      if (isMounted.current) {
        setAuthCheckTimedOut(true);
        setIsLoading(false);
        setIsRetrying(false);
        console.log(`Retry admin access verification timed out after ${retryTimeout}ms`);
      }
    }, retryTimeout);
    
    const verifyAdminAccess = async () => {
      try {
        if (!user) {
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
          return;
        }
        
        console.log('Retrying admin verification for:', user.id);
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
          if (!error.message?.includes('connect to database')) {
            toast({
              title: "Error",
              description: error.message || "Failed to verify admin status",
              variant: "destructive"
            });
          }
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
