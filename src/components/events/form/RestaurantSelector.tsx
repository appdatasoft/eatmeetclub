
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

interface RestaurantSelectorProps {
  restaurants: any[];
  selectedRestaurantId: string;
  setSelectedRestaurantId: (id: string) => void;
  onAddRestaurant: () => void;
}

const RestaurantSelector = ({
  restaurants,
  selectedRestaurantId,
  setSelectedRestaurantId,
  onAddRestaurant
}: RestaurantSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="restaurant">Select Restaurant*</Label>
      {restaurants.length > 0 ? (
        <Select 
          value={selectedRestaurantId} 
          onValueChange={setSelectedRestaurantId}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a restaurant" />
          </SelectTrigger>
          <SelectContent>
            {restaurants.map((restaurant) => (
              <SelectItem key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="flex flex-col space-y-2">
          <p className="text-sm text-amber-600">You don't have any restaurants yet.</p>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onAddRestaurant}
          >
            Add a Restaurant First
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantSelector;
