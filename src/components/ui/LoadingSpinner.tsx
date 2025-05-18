
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-4',
    large: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-spin ${sizeClasses[size]} border-primary border-t-transparent rounded-full mb-2`}></div>
      {text && <p className="text-gray-500 text-sm font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
