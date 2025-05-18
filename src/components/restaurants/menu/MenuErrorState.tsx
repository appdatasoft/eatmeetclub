
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface MenuErrorStateProps {
  title: string;
  description: string;
  onBack: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const MenuErrorState: React.FC<MenuErrorStateProps> = ({ 
  title, 
  description, 
  onBack, 
  onRetry, 
  isRetrying = false 
}) => {
  return (
    <DashboardLayout>
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">{description}</p>
        <div className="flex flex-wrap justify-center mt-4 gap-3">
          <Button onClick={onBack}>
            Go back
          </Button>
          
          {onRetry && (
            <Button 
              variant="secondary" 
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MenuErrorState;
