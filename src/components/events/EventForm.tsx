
import { useState, useEffect } from 'react';
import { Button } from '@/components/common/Button';
import EventBasicInfo from './form/EventBasicInfo';
import EventDateTimeInputs from './form/EventDateTimeInputs';
import EventCapacityPriceInputs from './form/EventCapacityPriceInputs';
import RestaurantSelector from './form/RestaurantSelector';
import EventCreationFeeNotice from './form/EventCreationFeeNotice';

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
      
      if (existingEvent.restaurant_id) {
        setSelectedRestaurantId(existingEvent.restaurant_id);
      }
    }
  }, [existingEvent, setSelectedRestaurantId]);
  
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
    
    console.log("Form submitted with data:", eventDetails);
    onSubmit(eventDetails);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Event Information</h2>
        
        <EventBasicInfo 
          eventTitle={formValues.eventTitle}
          eventDescription={formValues.eventDescription}
          handleChange={handleChange}
        />
        
        <EventDateTimeInputs 
          eventDate={formValues.eventDate}
          eventTime={formValues.eventTime}
          handleChange={handleChange}
        />
        
        <RestaurantSelector 
          restaurants={restaurants}
          selectedRestaurantId={selectedRestaurantId}
          setSelectedRestaurantId={setSelectedRestaurantId}
          onAddRestaurant={onAddRestaurant}
        />
        
        <EventCapacityPriceInputs 
          capacity={formValues.capacity}
          price={formValues.price}
          handleChange={handleChange}
        />
        
        <EventCreationFeeNotice 
          eventFee={eventFee} 
          isNewEvent={!existingEvent}
        />
      </div>
      
      <div>
        <Button 
          type="submit" 
          isLoading={isLoading}
          disabled={isLoading || !selectedRestaurantId}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
