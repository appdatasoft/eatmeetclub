
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  adminOnly?: boolean;
}

/**
 * ProtectedRoute - Ensures the user is authenticated before rendering children
 * If not authenticated, redirects to login with the current location saved for redirect after login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  adminOnly = false 
}) => {
  const { user, session, loading, isAdmin } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute - loading:", loading, "authenticated:", !!session, "path:", location.pathname);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 mb-8">Verifying your credentials...</p>
        
        {/* Skeleton UI for better UX */}
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-32 w-32 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    // Store the current location for redirect after login
    console.log("ProtectedRoute - redirecting to login from:", location.pathname);
    localStorage.setItem('redirectAfterLogin', location.pathname);
    
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check for admin requirement if specified
  if (adminOnly && !isAdmin) {
    console.log("ProtectedRoute - insufficient permissions, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Check for role requirement if specified
  if (requiredRole && user?.user_metadata?.role !== requiredRole) {
    console.log("ProtectedRoute - insufficient role permissions, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("ProtectedRoute - authorized access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
