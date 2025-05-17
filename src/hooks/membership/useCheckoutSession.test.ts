
/// <reference types="vitest" />
import { renderHook } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { useCheckoutSession } from '../useCheckoutSession'

// ✅ Create a simple mock for supabase client
const mockCreateCheckoutSession = vi.fn()
const mockToast = { toast: vi.fn() }

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: { user: { email: 'test@example.com' } },
        },
      }),
    },
  },
}))

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => mockToast,
}))

vi.mock('@/lib/stripe', () => ({
  createCheckoutSession: mockCreateCheckoutSession,
}))

describe('useCheckoutSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create checkout session with proper parameters', async () => {
    const mockUrl = 'https://checkout.stripe.com/session/abc123'
    mockCreateCheckoutSession.mockResolvedValue({ url: mockUrl })

    const { result } = renderHook(() => useCheckoutSession())

    await result.current.startCheckout({ plan: 'monthly' })

    expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
      email: 'test@example.com',
      plan: 'monthly',
    })

    expect(window.location.assign).toHaveBeenCalledWith(mockUrl)
  })

  it('should handle errors properly', async () => {
    mockCreateCheckoutSession.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useCheckoutSession())

    await result.current.startCheckout({ plan: 'monthly' })

    expect(mockToast.toast).toHaveBeenCalledWith({
      title: 'Checkout failed. Please try again.',
      variant: 'destructive',
    })
  })
})
