
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface RestaurantFallbackProps {
  onRetry: () => void;
  isRetrying: boolean;
  title?: string;
  description?: string;
  showHomeButton?: boolean;
}

const RestaurantFallback: React.FC<RestaurantFallbackProps> = ({ 
  onRetry,
  isRetrying,
  title = "Unable to Load Restaurant",
  description = "We're having trouble loading the restaurant data. This might be due to network issues or server load.",
  showHomeButton = true
}) => {
  const navigate = useNavigate();
  
  const goHome = () => {
    navigate('/');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-6">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
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
                  Retry Now
                </>
              )}
            </Button>
            
            {showHomeButton && (
              <Button variant="outline" onClick={goHome}>
                <Home className="h-4 w-4 mr-2" />
                Return to Home
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantFallback;
