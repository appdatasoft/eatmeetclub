
/// <reference types="vitest" />
import { describe, it, vi, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TicketPurchase } from '@/components/events/EventDetails/TicketPurchase'
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
        event={{
          id: "123",
          title: "Test Event",
          price: 25
        }} 
        ticketsRemaining={1}
        ticketsPercentage={50}
        isProcessing={false}
        handleTicketPurchase={vi.fn()}
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
        event={{
          id: "123",
          title: "Test Event", 
          price: 25
        }} 
        ticketsRemaining={5}
        ticketsPercentage={50}
        isProcessing={false}
        handleTicketPurchase={vi.fn()} 
      />
    )

    // Use the span with aria-label instead of spinbutton
    const count = screen.getByText('1')
    const increase = screen.getByRole('button', {
      name: /increase ticket count/i,
    })
    const decrease = screen.getByRole('button', {
      name: /decrease ticket count/i,
    })

    expect(count).toHaveTextContent('1')

    fireEvent.click(increase)
    expect(count).toHaveTextContent('2')

    fireEvent.click(decrease)
    expect(count).toHaveTextContent('1')
  })

  it('displays the correct total', () => {
    renderWithProviders(
      <TicketPurchase 
        event={{
          id: "123",
          title: "Test Event",
          price: 10
        }} 
        ticketsRemaining={10}
        ticketsPercentage={50}
        isProcessing={false}
        handleTicketPurchase={vi.fn()} 
      />
    )

    const total = screen.getByText(/\$10\.50/) // Assuming 5% service fee
    expect(total).toBeInTheDocument()
  })
})
