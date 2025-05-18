
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  
  console.log("PublicRoute - loading:", loading, "authenticated:", !!session);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-3 text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (session) {
    console.log("PublicRoute - redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("PublicRoute - showing public content");
  return <>{children}</>;
};

export default PublicRoute;
