
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { MemoryFormValues } from '../schema/memoryFormSchema';

interface RelatedEntitiesFieldsProps {
  form: UseFormReturn<MemoryFormValues>;
  restaurants: { id: string; name: string }[];
  events: { id: string; title: string }[];
}

const RelatedEntitiesFields = ({ form, restaurants, events }: RelatedEntitiesFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="restaurant_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Restaurant (Optional)</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {restaurants.map(restaurant => (
                  <SelectItem key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="event_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event (Optional)</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default RelatedEntitiesFields;
