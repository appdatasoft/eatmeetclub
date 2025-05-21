
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChangeEvent } from 'react';

interface EventBasicInfoProps {
  control?: Control<any>;
  restaurant?: {
    id: string;
    default_ambassador_fee_percentage?: number;
  } | null;
  // Add props for non-react-hook-form usage
  eventTitle?: string;
  eventDescription?: string;
  handleChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const EventBasicInfo: React.FC<EventBasicInfoProps> = ({ 
  control, 
  restaurant,
  eventTitle,
  eventDescription,
  handleChange
}) => {
  // If control is provided, use react-hook-form
  if (control) {
    return (
      <div className="space-y-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your event" 
                  className="resize-none min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="ambassador_fee_percentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ambassador Fee Percentage</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  max="30"
                  placeholder={restaurant?.default_ambassador_fee_percentage 
                    ? `Default: ${restaurant.default_ambassador_fee_percentage}%` 
                    : "Enter percentage (0-30%)"}
                  {...field}
                  onChange={(e) => {
                    // Ensure the value is within bounds
                    let value = parseFloat(e.target.value);
                    if (isNaN(value)) {
                      field.onChange("");
                    } else {
                      if (value < 0) value = 0;
                      if (value > 30) value = 30;
                      field.onChange(value.toString());
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Percentage of ticket revenue that goes to the event creator (ambassador). 
                {restaurant?.default_ambassador_fee_percentage 
                  ? ` Default is ${restaurant.default_ambassador_fee_percentage}% if left empty.` 
                  : ' Leave empty to use restaurant default.'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  }
  
  // If control is not provided, use regular form inputs
  return (
    <div className="space-y-4">
      <div className="form-group">
        <label htmlFor="eventTitle" className="block text-gray-700">Event Title</label>
        <Input 
          id="eventTitle" 
          name="eventTitle" 
          value={eventTitle || ''} 
          onChange={handleChange}
          placeholder="Enter event title" 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="eventDescription" className="block text-gray-700">Description</label>
        <Textarea 
          id="eventDescription" 
          name="eventDescription" 
          value={eventDescription || ''} 
          onChange={handleChange}
          placeholder="Describe your event" 
          className="resize-none min-h-[150px]"
        />
      </div>
    </div>
  );
};

export default EventBasicInfo;
