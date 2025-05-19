
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useDashboardAuth = () => {
  const location = useLocation();
  const { user, isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setAuthCheckTimeout(true);
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  return {
    user,
    isAdmin,
    isLoading: isLoading && !authCheckTimeout,
    authCheckTimeout,
    redirectAttempted,
    setRedirectAttempted,
    currentPath: location.pathname,
    showToast: (title: string, description: string) => {
      toast({ title, description });
    }
  };
};
