
import React from 'react';
import { Loader2 } from 'lucide-react';

interface TemplatesLoadingStateProps {
  message?: string;
}

const TemplatesLoadingState: React.FC<TemplatesLoadingStateProps> = ({ 
  message = "Loading templates..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
};

export default TemplatesLoadingState;
