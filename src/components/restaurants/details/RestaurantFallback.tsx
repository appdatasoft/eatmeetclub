
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RestaurantFallbackProps {
  onRetry: () => void;
  isRetrying: boolean;
}

const RestaurantFallback: React.FC<RestaurantFallbackProps> = ({ 
  onRetry,
  isRetrying 
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Unable to Load Restaurant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-6">
            We're having trouble loading the restaurant data. This might be due to network issues or server load.
          </p>
          <Button 
            onClick={onRetry} 
            disabled={isRetrying}
            className="flex items-center"
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
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantFallback;
