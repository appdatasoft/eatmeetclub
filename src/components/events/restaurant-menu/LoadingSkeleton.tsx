
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <Skeleton className="h-8 w-36" />
      </div>
      
      {/* Generate multiple skeleton items */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div 
          key={index} 
          className="flex items-center space-x-4 p-4 border rounded-md"
          data-testid="loading-skeleton-item"
        >
          <Skeleton className="h-14 w-14 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-4 w-8" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
