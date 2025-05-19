
import React from 'react';

const LoadingSkeleton = () => {
  // Create an array of 5 items for the loading skeleton
  const skeletonItems = Array.from({ length: 5 }, (_, i) => i);
  
  return (
    <div className="space-y-6 animate-pulse">
      {skeletonItems.map((index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2 w-2/3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="mt-4 h-20 bg-gray-100 rounded"></div>
          <div className="mt-4 flex space-x-2">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
