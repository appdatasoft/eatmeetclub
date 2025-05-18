
import React from 'react';
import { Loader2, Check } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface MenuItemsListProps {
  menuItems: MenuItem[];
  selectedItems: string[];
  loading: boolean;
  onToggleItem: (itemId: string) => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({
  menuItems,
  selectedItems,
  loading,
  onToggleItem
}) => {
  return (
    <div className="max-h-[400px] overflow-y-auto py-4">
      {loading ? (
        <div className="flex justify-center items-center p-8" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="sr-only">Loading menu items</span>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No menu items available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {menuItems.map((item) => (
            <MenuItem 
              key={item.id} 
              item={item} 
              isSelected={selectedItems.includes(item.id)} 
              onToggle={() => onToggleItem(item.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface MenuItemProps {
  item: MenuItem;
  isSelected: boolean;
  onToggle: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, isSelected, onToggle }) => {
  return (
    <div
      className={`p-3 rounded-md cursor-pointer border ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border'
      }`}
      onClick={onToggle}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="font-medium">{item.name}</div>
          {item.description && (
            <div className="text-sm text-muted-foreground mt-1">{item.description}</div>
          )}
        </div>
        <div className="ml-4 flex items-center">
          <div className="text-muted-foreground mr-3">${item.price.toFixed(2)}</div>
          {isSelected && (
            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-primary-foreground" data-testid="check-icon" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemsList;
