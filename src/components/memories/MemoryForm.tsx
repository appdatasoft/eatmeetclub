
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Memory } from '@/types/memory';
import { useMemoryMedia } from '@/hooks/useMemoryMedia';
import { useAuth } from '@/hooks/useAuth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface MemoryFormProps {
  onSubmit: (data: any) => Promise<void>;
  existingMemory?: Memory;
  restaurants: { id: string; name: string }[];
  events: { id: string; title: string }[];
  isLoading: boolean;
}

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  location: z.string().min(3, { message: 'Location is required' }),
  date: z.date({
    required_error: 'Please select a date',
  }),
  privacy: z.enum(['public', 'private', 'unlisted']),
  event_id: z.string().optional(),
  restaurant_id: z.string().optional(),
  photo: z.instanceof(File).optional(),
});

const MemoryForm: React.FC<MemoryFormProps> = ({
  onSubmit,
  existingMemory,
  restaurants,
  events,
  isLoading,
}) => {
  const { user } = useAuth();
  const { uploadMedia, isUploading } = useMemoryMedia();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: existingMemory?.title || '',
      location: existingMemory?.location || '',
      date: existingMemory ? new Date(existingMemory.date) : new Date(),
      privacy: existingMemory?.privacy || 'private',
      event_id: existingMemory?.event_id || undefined,
      restaurant_id: existingMemory?.restaurant_id || undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    form.setValue('photo', file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    // Handle photo upload if there is one
    let photoUrl = null;
    if (data.photo) {
      photoUrl = await uploadMedia(data.photo, user.id);
    }
    
    const formattedDate = format(data.date, 'yyyy-MM-dd');
    
    // Prepare form data
    const memoryData = {
      title: data.title,
      location: data.location,
      date: formattedDate,
      privacy: data.privacy,
      event_id: data.event_id || null,
      restaurant_id: data.restaurant_id || null,
    };
    
    await onSubmit({ ...memoryData, photoUrl });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Memory Title*</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for your memory" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location*</FormLabel>
              <FormControl>
                <Input placeholder="Where did this memory take place?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date*</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
        
        <FormField
          control={form.control}
          name="privacy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Privacy Setting*</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="public" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Public - Anyone can see this memory
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="unlisted" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Unlisted - Only people with the link and attendees can see this memory
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="private" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Private - Only you can see this memory
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-3">
          <FormLabel>Memory Photo (Optional)</FormLabel>
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center">
                {photoPreview ? (
                  <div className="relative w-full">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => {
                        form.setValue('photo', undefined);
                        setPhotoPreview(null);
                      }}
                    >
                      Change Photo
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || isUploading}
          className="w-full"
        >
          {isLoading || isUploading ? (
            <>
              <span className="animate-spin mr-2">⌛</span> 
              {existingMemory ? 'Updating Memory...' : 'Creating Memory...'}
            </>
          ) : (
            existingMemory ? 'Update Memory' : 'Create Memory'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default MemoryForm;
