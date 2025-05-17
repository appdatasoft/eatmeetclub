
import React from "react";

const LoadingSkeleton = () => {
  return (
    <div className="space-y-8 py-4">
      {[1, 2, 3].map((item) => (
        <div 
          key={item}
          data-testid="loading-skeleton-item"
          className="flex flex-col gap-4 animate-pulse"
        >
          <div className="h-8 bg-gray-200 rounded-md w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded-md w-full"></div>
          <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
          <div className="h-6 bg-gray-200 rounded-md w-1/4"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
