
import React from 'react';
import { AlertCircle, RefreshCcw, ExternalLink } from 'lucide-react';
import { Button } from './button';

interface RetryAlertProps {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
  title?: string;
  severity?: 'warning' | 'error' | 'info';
  showSpinner?: boolean;
  isApiKeyError?: boolean;
}

const RetryAlert = ({ 
  message, 
  onRetry, 
  isRetrying = false, 
  title = "Connection Error",
  severity = 'warning',
  showSpinner = true,
  isApiKeyError = false
}: RetryAlertProps) => {
  const severityClasses = {
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      description: 'text-amber-700',
      icon: 'text-amber-500',
      button: 'bg-white hover:bg-amber-50 text-amber-700 border-amber-300'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      description: 'text-red-700',
      icon: 'text-red-500',
      button: 'bg-white hover:bg-red-50 text-red-700 border-red-300'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      description: 'text-blue-700',
      icon: 'text-blue-500',
      button: 'bg-white hover:bg-blue-50 text-blue-700 border-blue-300'
    }
  };
  
  const classes = severityClasses[severity];

  return (
    <div className={`${classes.bg} border ${classes.border} rounded-md p-4 mb-4`}>
      <div className="flex items-start">
        <AlertCircle className={`h-5 w-5 ${classes.icon} mr-3 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${classes.text}`}>{title}</h3>
          <div className={`mt-1 text-sm ${classes.description}`}>
            <p>{message}</p>
            
            {isApiKeyError && (
              <div className="mt-2 text-sm">
                <p className="font-medium">How to fix API key issues:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Check your Supabase project settings</li>
                  <li>Verify environment variables are correctly configured</li>
                  <li>Ensure the API key has not been revoked or rotated</li>
                </ul>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onRetry}
              disabled={isRetrying}
              className={classes.button}
            >
              {isRetrying ? (
                <>
                  {showSpinner && <RefreshCcw className="mr-2 h-3 w-3 animate-spin" />}
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-3 w-3" />
                  <span>Retry Connection</span>
                </>
              )}
            </Button>
            
            {isApiKeyError && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                className={`ml-2 ${classes.text}`}
              >
                <ExternalLink className="mr-2 h-3 w-3" />
                <span>Supabase Dashboard</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetryAlert;
export { RetryAlert };
