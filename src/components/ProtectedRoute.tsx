
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute - loading:", loading, "authenticated:", !!session, "path:", location.pathname);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-3 text-gray-500">Verifying your credentials...</p>
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

  // Check for role requirement if specified
  if (requiredRole && user?.user_metadata?.role !== requiredRole) {
    console.log("ProtectedRoute - insufficient permissions, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("ProtectedRoute - authorized access granted");
  return <>{children}</>;
};

export default ProtectedRoute;
