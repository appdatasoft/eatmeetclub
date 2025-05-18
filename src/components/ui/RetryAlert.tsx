
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface RetryAlertProps {
  title?: string;
  message: string;
  onRetry: () => void;
  isRetrying: boolean;
  severity?: 'info' | 'warning' | 'error';
  showSpinner?: boolean;
}

const RetryAlert: React.FC<RetryAlertProps> = ({
  title,
  message,
  onRetry,
  isRetrying,
  severity = 'warning',
  showSpinner = true
}) => {
  // Map severity to color variants
  const variantMap = {
    info: {
      variant: "default",
      icon: <AlertCircle className="h-4 w-4" />,
      bgColor: "bg-blue-50 border-blue-200"
    },
    warning: {
      variant: "default",
      icon: <AlertCircle className="h-4 w-4" />,
      bgColor: "bg-yellow-50 border-yellow-200"
    },
    error: {
      variant: "destructive",
      icon: <AlertCircle className="h-4 w-4" />,
      bgColor: ""
    }
  };

  const { icon, bgColor } = variantMap[severity];

  return (
    <Alert variant="default" className={`${bgColor} mb-4`}>
      {icon}
      {title && <h4 className="font-medium">{title}</h4>}
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          disabled={isRetrying}
          className="ml-4 whitespace-nowrap"
        >
          {isRetrying && showSpinner ? (
            <>
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default RetryAlert;
