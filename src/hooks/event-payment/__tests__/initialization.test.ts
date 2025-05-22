
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useEventPaymentHandler } from '../useEventPaymentHandler';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EventDetails } from '@/types/event';

// Helper function to create a mock event
const createMockEvent = (): EventDetails => ({
  id: 'event-123',
  title: 'Test Event',
  description: 'Test event description',
  date: '2025-05-15',
  time: '18:00',
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
    description: 'Test restaurant description'
  },
  cover_image: null,
  tickets_sold: 0
});

// Helper function to create mock localStorage
const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { Object.keys(store).forEach(key => delete store[key]); }
  };
};

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn()
    },
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('useEventPaymentHandler initialization', () => {
  const mockEvent = createMockEvent();
  const mockToast = { toast: vi.fn() };
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue(mockToast);
    (useNavigate as any).mockReturnValue(mockNavigate);
    Object.defineProperty(window, 'localStorage', {
      value: createMockLocalStorage()
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    expect(result.current.isPaymentProcessing).toBe(false);
    expect(typeof result.current.handleBuyTickets).toBe('function');
  });

  it('should show error toast when event is null', async () => {
    const { result } = renderHook(() => useEventPaymentHandler(null));
    
    await result.current.handleBuyTickets(2);
    
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Event details not available',
      variant: 'destructive'
    });
  });
});
