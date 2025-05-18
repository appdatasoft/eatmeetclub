import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginSkeleton } from '@/components/auth/LoginSkeleton';
import { useRedirectPath } from '@/hooks/useRedirectPath';

interface AuthRedirectProps {
  children: React.ReactNode;
}

/**
 * AuthRedirect - Redirects authenticated users away from public routes
 * For use on login, register and other public pages
 */
const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { session, isLoading } = useAuth();
  const location = useLocation();
  const getRedirectPath = useRedirectPath();

  useEffect(() => {
    console.log("AuthRedirect - checking auth status:", { isLoading, authenticated: !!session });
  }, [isLoading, session]);

  // Show loading state while auth is being checked
  if (isLoading) {
    return <LoginSkeleton />;
  }

  // If user is authenticated, redirect to dashboard or specified redirect path
  if (session) {
    const redirectPath = getRedirectPath();
    console.log("AuthRedirect - redirecting authenticated user to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // Otherwise, render the children (login form, register form, etc.)
  return <>{children}</>;
};

export default AuthRedirect;
