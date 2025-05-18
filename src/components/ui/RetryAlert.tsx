
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RetryAlertProps {
  title?: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const RetryAlert: React.FC<RetryAlertProps> = ({ 
  title = "Error",
  message, 
  onRetry, 
  isRetrying = false 
}) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4 mr-2" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span>
          {message}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          disabled={isRetrying}
          className="ml-auto flex items-center"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default RetryAlert;
