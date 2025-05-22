
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
  cover_image: null
});

// Add missing utility functions
export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

export const setupWindowLocation = () => {
  // Save original location object
  const originalLocation = window.location;

  // Mock location
  delete window.location;
  window.location = {
    href: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  } as unknown as Location;

  // Return cleanup function
  return () => {
    window.location = originalLocation;
  };
};
