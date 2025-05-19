
import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface RetryAlertProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const RetryAlert = ({ message, onRetry, isRetrying = false }: RetryAlertProps) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800">Connection Error</h3>
          <div className="mt-1 text-sm text-amber-700">
            <p>{message}</p>
          </div>
          <div className="mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              disabled={isRetrying}
              className="bg-white hover:bg-amber-50 text-amber-700 border-amber-300"
            >
              {isRetrying ? (
                <>
                  <RefreshCcw className="mr-2 h-3 w-3 animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-3 w-3" />
                  <span>Retry Connection</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetryAlert;
