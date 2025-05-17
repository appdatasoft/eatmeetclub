
import { vi } from 'vitest';
import { EventDetails } from '@/hooks/types/eventTypes';

// Create mock event data for tests
export const createMockEvent = (): EventDetails => ({
  id: 'event123',
  title: 'Test Event',
  description: 'Test Description',
  price: 25,
  capacity: 100,
  user_id: 'user123',
  published: true,
  restaurant: {
    id: 'rest123',
    name: 'Test Restaurant',
    address: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    zipcode: '12345',
    description: 'Test Description'
  },
  date: '2023-06-15',
  time: '19:00',
  tickets_sold: 0
});

// Create a mock localStorage for tests
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

// Mock window.location functionality
export const setupWindowLocation = () => {
  Object.defineProperty(window, 'location', {
    value: {
      href: ''
    },
    writable: true
  });
};
