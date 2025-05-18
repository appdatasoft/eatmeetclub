
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MenuHeaderProps {
  restaurantName: string;
  handleAddItem: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ restaurantName, handleAddItem }) => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const eventName = searchParams.get('eventName');
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-4">
        <div>
          <h1 className="text-2xl font-bold">{restaurantName || 'Restaurant'} Menu</h1>
          {eventId && eventName && (
            <p className="text-sm text-gray-500 mt-1">
              Managing menu for event: <span className="font-medium">{eventName}</span>
            </p>
          )}
          {eventId && !eventName && (
            <p className="text-sm text-gray-500 mt-1">
              Managing menu for this event
            </p>
          )}
        </div>
        
        <Button onClick={handleAddItem} className="flex items-center">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Menu Item
        </Button>
      </div>
      
      {eventId && (
        <Alert className="bg-blue-50 border border-blue-200">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Any changes you make to this menu will be specific to this event.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MenuHeader;
