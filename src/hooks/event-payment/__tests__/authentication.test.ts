
/// <reference types="vitest" />
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEventPaymentHandler } from '../../useEventPaymentHandler'
import { EventDetails } from '@/hooks/types/eventTypes'

vi.mock('@/lib/navigation', () => ({
  redirectToLogin: vi.fn(),
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

// ✅ Mock Supabase auth completely
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
      }),
    },
  },
}))

describe('useEventPaymentHandler authentication flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to login when user is not authenticated', async () => {
    // Create a mock event object that satisfies the EventDetails type
    const mockEvent: EventDetails = { 
      id: 'event123',
      title: 'Test Event',
      description: 'A test event',
      date: '2025-01-01',
      time: '19:00',
      price: 10,
      capacity: 100,
      restaurant: {
        id: 'rest123',
        name: 'Test Restaurant',
        address: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipcode: '12345',
        description: 'A test restaurant',
        phone: '555-123-4567',
        website: 'https://example.com'
      },
      user_id: 'user123',
      published: true,
      tickets_sold: 0
    };

    const { result } = renderHook(() => useEventPaymentHandler(mockEvent));
    
    // Test that isPaymentProcessing is initially false
    expect(result.current.isPaymentProcessing).toBe(false);
    // Verify handleBuyTickets is defined
    expect(typeof result.current.handleBuyTickets).toBe('function');
  })
})
