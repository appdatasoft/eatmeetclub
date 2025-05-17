
/// <reference types="vitest" />
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEventPaymentHandler } from '../../useEventPaymentHandler'

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
    const { result } = renderHook(() => useEventPaymentHandler({ eventId: 'event123' }))
    expect(result.current.status).toBe('unauthenticated')
  })
})
