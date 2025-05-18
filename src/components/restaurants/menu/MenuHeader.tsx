import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface MenuHeaderProps {
  restaurantName: string;
  handleAddItem: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ restaurantName, handleAddItem }) => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold">{restaurantName || 'Restaurant'} Menu</h1>
        {eventId && (
          <p className="text-sm text-gray-500 mt-1">
            Managing menu for event
          </p>
        )}
      </div>
      
      <Button onClick={handleAddItem} className="flex items-center">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Menu Item
      </Button>
    </div>
  );
};

export default MenuHeader;
