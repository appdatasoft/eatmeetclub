
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

interface MenuSelectionModalProps {
  eventId: string;
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

const MenuSelectionModal: React.FC<MenuSelectionModalProps> = ({
  eventId,
  restaurantId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  
  useEffect(() => {
    if (isOpen) {
      fetchMenuItems();
      fetchUserSelections();
    }
  }, [isOpen, restaurantId]);
  
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('restaurant_menu_items')
        .select('id, name, description, price')
        .eq('restaurant_id', restaurantId)
        .order('name');
        
      if (error) throw error;
      
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load menu items.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserSelections = async () => {
    if (!user?.id) return;
    
    try {
      // Using type assertion to bypass TypeScript errors
      const { data, error } = await (supabase as any)
        .from('event_menu_selections')
        .select('menu_item_id')
        .eq('event_id', eventId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Safely access the data with type assertion
      const selected = (data as { menu_item_id: string }[])?.map(item => item.menu_item_id) || [];
      setSelectedItems(selected);
    } catch (error) {
      console.error('Error fetching user selections:', error);
    }
  };
  
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };
  
  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to select menu items.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // First delete all existing selections using type assertion
      await (supabase as any)
        .from('event_menu_selections')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);
      
      // Then insert new selections
      if (selectedItems.length > 0) {
        const selections = selectedItems.map(menuItemId => ({
          event_id: eventId,
          user_id: user.id,
          menu_item_id: menuItemId
        }));
        
        // Using type assertion to bypass TypeScript errors
        const { error } = await (supabase as any)
          .from('event_menu_selections')
          .insert(selections);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Selections Saved',
        description: 'Your menu selections have been saved.',
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving menu selections:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your selections.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Menu Items</DialogTitle>
          <DialogDescription>
            Choose the dishes you're interested in. This will help generate questions for the team game.
          </DialogDescription>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto py-4">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No menu items available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-md cursor-pointer border ${
                    selectedItems.includes(item.id) ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => toggleSelection(item.id)}
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
                      {selectedItems.includes(item.id) && (
                        <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="text-sm text-muted-foreground pt-2">
              {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Selections
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MenuSelectionModal;
