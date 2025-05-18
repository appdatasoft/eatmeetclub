
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RetryAlertProps {
  title?: string;
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
  showSpinner?: boolean;
  severity?: 'warning' | 'error' | 'info';
}

const RetryAlert: React.FC<RetryAlertProps> = ({ 
  title = "Connection Issue",
  message, 
  onRetry, 
  isRetrying = false,
  showSpinner = true,
  severity = 'warning'
}) => {
  // Determine the alert variant based on severity
  const getVariant = () => {
    switch(severity) {
      case 'error': return 'destructive';
      case 'info': return 'default';
      case 'warning':
      default: return 'warning';
    }
  };
  
  // Determine the icon based on severity
  const Icon = AlertTriangle;
  
  return (
    <Alert variant={getVariant()} className="mb-4">
      <Icon className="h-4 w-4 mr-2" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
        <div>
          {title && <AlertTitle className="mb-1">{title}</AlertTitle>}
          <AlertDescription className="text-sm">
            {message}
          </AlertDescription>
        </div>
        <Button 
          variant={severity === 'error' ? "destructive" : "outline"} 
          size="sm" 
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-2 sm:mt-0 sm:ml-4 flex items-center"
        >
          {isRetrying && showSpinner ? (
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
      </div>
    </Alert>
  );
};

export default RetryAlert;
