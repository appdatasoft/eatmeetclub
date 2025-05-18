
import { useState } from 'react';
import { MenuItem } from './MenuItemCard';
import MenuItemCard from './MenuItemCard';
import { useToast } from '@/hooks/use-toast';
import RetryAlert from '@/components/ui/RetryAlert';

interface MenuItemsListProps {
  menuItems: MenuItem[];
  handleEditItem: (item: MenuItem) => void;
  handleDeleteItem: (itemId: string) => void;
  isLoading?: boolean;
}

const MenuItemsList = ({
  menuItems,
  handleEditItem,
  handleDeleteItem,
  isLoading = false
}: MenuItemsListProps) => {
  const { toast } = useToast();
  const [retrying, setRetrying] = useState(false);
  
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((item) => (
          <div key={item} className="border border-gray-200 rounded-lg p-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Menu Items</h3>
        <p className="text-gray-600 mb-4">
          Your restaurant doesn't have any menu items yet. Click the "Add Menu Item" button above to create one.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {menuItems.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onEdit={handleEditItem}
          onDelete={handleDeleteItem}
        />
      ))}
    </div>
  );
};

export default MenuItemsList;
