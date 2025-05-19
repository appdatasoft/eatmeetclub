
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplatesErrorStateProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const TemplatesErrorState: React.FC<TemplatesErrorStateProps> = ({
  message,
  onRetry,
  isRetrying = false
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="bg-red-50 border border-red-200 rounded-full p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Unable to Load Templates</h2>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      <Button 
        onClick={onRetry} 
        disabled={isRetrying}
        className="flex items-center gap-2"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Try Again
          </>
        )}
      </Button>
    </div>
  );
};

export default TemplatesErrorState;
