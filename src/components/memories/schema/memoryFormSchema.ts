
import { z } from 'zod';

export const memoryFormSchema = z.object({
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

export type MemoryFormValues = z.infer<typeof memoryFormSchema>;
