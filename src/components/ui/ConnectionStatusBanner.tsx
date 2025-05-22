
import React from 'react';
import { AlertTriangle, CheckCircle, RefreshCcw, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { useSupabaseConnectionStatus } from '@/hooks/useSupabaseConnectionStatus';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ConnectionIssueHelper } from './ConnectionIssueHelper';

interface ConnectionStatusBannerProps {
  className?: string;
  onManualRefresh?: () => Promise<void>;
  showOnConnected?: boolean;
}

export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
  className,
  onManualRefresh,
  showOnConnected = false
}) => {
  const { status, lastChecked, errorMessage, errorType, checkConnection, getErrorSuggestion } = useSupabaseConnectionStatus();
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [manualRetryAttempted, setManualRetryAttempted] = React.useState(false);
  const [showDetailedHelp, setShowDetailedHelp] = React.useState(false);
  
  const handleRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    setManualRetryAttempted(true);
    
    try {
      await checkConnection();
      if (onManualRefresh) {
        await onManualRefresh();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  // Don't show anything if connected and showOnConnected is false
  if (status === 'connected' && !showOnConnected && !manualRetryAttempted) {
    return null;
  }
  
  // Hide after a successful retry
  if (status === 'connected' && manualRetryAttempted) {
    return (
      <div className={cn("rounded-md px-4 py-2 mb-4 bg-green-50 border border-green-200 text-green-800 flex items-center justify-between transition-opacity", className)}>
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <span>Connection restored. Last checked {formatDistanceToNow(lastChecked)} ago.</span>
        </div>
      </div>
    );
  }
  
  // Show API key error with expanded helper
  if (status === 'error' && errorType === 'api_key' && showDetailedHelp) {
    return (
      <ConnectionIssueHelper 
        errorMessage={errorMessage || undefined}
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    );
  }
  
  // Show error if status is error
  if (status === 'error') {
    return (
      <div className={cn("rounded-md p-4 mb-4 bg-amber-50 border border-amber-200 text-amber-800", className)}>
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800">Connection Issue</h3>
            <div className="mt-1 text-sm">
              <p>{errorMessage || "Unable to connect to the database. Some features may not work."}</p>
              {errorType && (
                <p className="mt-1 text-amber-700">{getErrorSuggestion()}</p>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRetry}
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
              
              {!showDetailedHelp && errorType === 'api_key' && (
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => setShowDetailedHelp(true)}
                  className="text-amber-700 px-2"
                >
                  Show More Help
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show checking status if showOnConnected is true
  if (showOnConnected) {
    return (
      <div className={cn("rounded-md p-2 mb-4 bg-blue-50 border border-blue-200 text-blue-800", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {status === 'checking' ? (
              <RefreshCcw className="h-4 w-4 text-blue-500 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
            )}
            <span className="text-sm">
              {status === 'checking' 
                ? "Checking database connection..." 
                : `Connected. Last checked ${formatDistanceToNow(lastChecked)} ago.`}
            </span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRetry}
            disabled={isRetrying}
            className="bg-white text-blue-700 border-blue-300 text-xs px-2 py-1 h-auto"
          >
            {isRetrying ? "Checking..." : "Check Now"}
          </Button>
        </div>
      </div>
    );
  }
  
  return null;
};
