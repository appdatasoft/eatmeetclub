
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MenuHeaderProps {
  restaurantName: string;
  handleAddItem: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ restaurantName, handleAddItem }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Restaurant Menu</h1>
        <p className="text-muted-foreground">
          Manage the menu for {restaurantName}
        </p>
      </div>
      <Button onClick={handleAddItem}>
        <Plus className="h-4 w-4 mr-2" />
        Add Menu Item
      </Button>
    </div>
  );
};

export default MenuHeader;
