
/// <reference types="vitest" />
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketPurchase } from './TicketPurchase'
import { ThemeProvider } from '@/components/theme-provider'

// ✅ Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// ✅ Mock useCheckoutSession hook
vi.mock('@/hooks/membership/useCheckoutSession', () => ({
  useCheckoutSession: () => ({
    startCheckout: vi.fn(),
    loading: false,
  }),
}))

// ✅ Mock Supabase auth
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { email: 'test@example.com' } } },
      }),
    },
  },
}))

// ✅ Mock useReferralTracking
vi.mock('@/hooks/useReferralTracking', () => ({
  useReferralTracking: () => ({
    getStoredReferralCode: vi.fn().mockReturnValue(null),
    referralCode: null,
  }),
}))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('TicketPurchase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('disables increase button when ticket count equals ticketsRemaining', () => {
    renderWithProviders(
      <TicketPurchase 
        eventId="123" 
        ticketPrice={25} 
        ticketsRemaining={1} 
        isProcessing={false}
        onPurchase={vi.fn()}
      />
    )

    const increaseButton = screen.getByRole('button', {
      name: /increase ticket count/i,
    })
    expect(increaseButton).toBeDisabled()
  })

  it('increases and decreases ticket count with buttons', () => {
    renderWithProviders(
      <TicketPurchase 
        eventId="123" 
        ticketPrice={25} 
        ticketsRemaining={5}
        isProcessing={false}
        onPurchase={vi.fn()} 
      />
    )

    const input = screen.getByRole('spinbutton', {
      name: /number of tickets/i,
    })
    const increase = screen.getByRole('button', {
      name: /increase ticket count/i,
    })
    const decrease = screen.getByRole('button', {
      name: /decrease ticket count/i,
    })

    expect(input).toHaveValue(1)

    fireEvent.click(increase)
    expect(input).toHaveValue(2)

    fireEvent.click(decrease)
    expect(input).toHaveValue(1)
  })

  it('displays the correct total', () => {
    renderWithProviders(
      <TicketPurchase 
        eventId="123" 
        ticketPrice={10} 
        ticketsRemaining={10}
        isProcessing={false}
        onPurchase={vi.fn()} 
      />
    )

    const total = screen.getByText(/\$10\.50/) // Assuming 5% service fee
    expect(total).toBeInTheDocument()
  })
})
