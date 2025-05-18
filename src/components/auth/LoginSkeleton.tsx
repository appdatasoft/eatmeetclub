
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const LoginSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-500">Checking authentication...</p>
      
      {/* Skeleton UI for better UX */}
      <div className="w-full mt-8 space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};
