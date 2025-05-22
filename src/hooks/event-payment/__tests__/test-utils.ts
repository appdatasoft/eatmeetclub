
import { EventDetails } from '@/hooks/types/eventTypes';

export const createMockEvent = (overrides = {}): EventDetails => ({
  id: 'event-123',
  title: 'Test Event',
  description: 'Test event description',
  price: 25,
  capacity: 100,
  user_id: 'user-123',
  published: true,
  restaurant: {
    id: 'restaurant-123',
    name: 'Test Restaurant',
    address: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipcode: '12345',
    description: 'Test restaurant description',
  },
  date: '2025-05-15',
  time: '18:00',
  tickets_sold: 0,
  cover_image: null, // Adding the required cover_image property
  ...overrides
});
