
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, session, loading } = useAuth();
  
  console.log("PublicRoute - loading:", loading, "authenticated:", !!session);

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500 mb-8">Checking authentication...</p>
        
        {/* Skeleton UI for better UX */}
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-64 w-full rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
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
