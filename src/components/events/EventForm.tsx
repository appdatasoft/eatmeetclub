
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/common/Button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

interface EventFormProps {
  restaurants: any[];
  selectedRestaurantId: string;
  setSelectedRestaurantId: (id: string) => void;
  onSubmit: (eventDetails: any) => void;
  isLoading: boolean;
  onAddRestaurant: () => void;
}

const EventForm: React.FC<EventFormProps> = ({
  restaurants,
  selectedRestaurantId,
  setSelectedRestaurantId,
  onSubmit,
  isLoading,
  onAddRestaurant
}) => {
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    const eventDetails = {
      title: formData.get('eventTitle') as string,
      description: formData.get('eventDescription') as string,
      date: formData.get('eventDate') as string,
      time: formData.get('eventTime') as string,
      restaurant_id: selectedRestaurantId,
      capacity: parseInt(formData.get('capacity') as string),
      price: parseFloat(formData.get('price') as string),
    };
    
    onSubmit(eventDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Event Information</h2>
        
        <div className="space-y-2">
          <Label htmlFor="eventTitle">Event Title*</Label>
          <Input id="eventTitle" name="eventTitle" required placeholder="Give your event a catchy title" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="eventDescription">Description*</Label>
          <Textarea 
            id="eventDescription"
            name="eventDescription" 
            required 
            placeholder="Describe what makes this event special..." 
            className="min-h-[120px]"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date*</Label>
            <Input id="eventDate" name="eventDate" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime">Event Time*</Label>
            <Input id="eventTime" name="eventTime" type="time" required />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="restaurant">Select Restaurant*</Label>
          {restaurants.length > 0 ? (
            <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity*</Label>
            <Input id="capacity" name="capacity" type="number" min="1" required placeholder="Number of seats available" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price per Person ($)*</Label>
            <Input id="price" name="price" type="number" min="0" step="0.01" required placeholder="0.00" />
          </div>
        </div>
      </div>
      
      <div>
        <Button type="submit" isLoading={isLoading}>
          Continue to Payment
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
