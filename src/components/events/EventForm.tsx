
import { useState, useEffect } from 'react';
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
  eventFee?: number;
  existingEvent?: any;
  submitLabel?: string;
}

const EventForm: React.FC<EventFormProps> = ({
  restaurants,
  selectedRestaurantId,
  setSelectedRestaurantId,
  onSubmit,
  isLoading,
  onAddRestaurant,
  eventFee = 50,
  existingEvent,
  submitLabel = "Add Event"
}) => {
  const [formValues, setFormValues] = useState({
    eventTitle: '',
    eventDescription: '',
    eventDate: '',
    eventTime: '',
    capacity: '',
    price: ''
  });
  
  // Populate form with existing event data if available
  useEffect(() => {
    if (existingEvent) {
      setFormValues({
        eventTitle: existingEvent.title || '',
        eventDescription: existingEvent.description || '',
        eventDate: existingEvent.date || '',
        eventTime: existingEvent.time || '',
        capacity: existingEvent.capacity ? String(existingEvent.capacity) : '',
        price: existingEvent.price ? String(existingEvent.price) : ''
      });
    }
  }, [existingEvent]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
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
          <Input 
            id="eventTitle" 
            name="eventTitle" 
            required 
            placeholder="Give your event a catchy title" 
            value={formValues.eventTitle}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="eventDescription">Description*</Label>
          <Textarea 
            id="eventDescription"
            name="eventDescription" 
            required 
            placeholder="Describe what makes this event special..." 
            className="min-h-[120px]"
            value={formValues.eventDescription}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date*</Label>
            <Input 
              id="eventDate" 
              name="eventDate" 
              type="date" 
              required 
              value={formValues.eventDate}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventTime">Event Time*</Label>
            <Input 
              id="eventTime" 
              name="eventTime" 
              type="time" 
              required 
              value={formValues.eventTime}
              onChange={handleChange}
            />
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
            <Input 
              id="capacity" 
              name="capacity" 
              type="number" 
              min="1" 
              required 
              placeholder="Number of seats available"
              value={formValues.capacity}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price per Person*</Label>
            <Input 
              id="price" 
              name="price" 
              type="number" 
              min="0" 
              step="0.01" 
              required 
              placeholder="Ticket price per person"
              value={formValues.price}
              onChange={handleChange}
            />
          </div>
        </div>
        
        {!existingEvent && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm font-medium">A ${eventFee.toFixed(2)} event creation fee will be charged when you add this event.</p>
          </div>
        )}
      </div>
      
      <div>
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
