
import React, { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface TicketPurchaseProps {
  price: number;
  ticketsRemaining: number;
  onBuyTickets: (ticketCount: number) => void;
  isPaymentProcessing: boolean;
  isLoggedIn: boolean;
}

export const TicketPurchase: React.FC<TicketPurchaseProps> = ({
  price,
  ticketsRemaining,
  onBuyTickets,
  isPaymentProcessing,
  isLoggedIn
}) => {
  const [ticketCount, setTicketCount] = useState(1)
  const { toast } = useToast()

  const handleIncrease = () => {
    if (ticketCount < ticketsRemaining) {
      setTicketCount((prev) => prev + 1)
    }
  }

  const handleDecrease = () => {
    if (ticketCount > 1) {
      setTicketCount((prev) => prev - 1)
    }
  }

  const handleBuy = () => {
    onBuyTickets(ticketCount);
  }

  const subtotal = price * ticketCount
  const serviceFee = +(subtotal * 0.05).toFixed(2)
  const total = +(subtotal + serviceFee).toFixed(2)

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
      <h3 className="text-lg font-semibold mb-4">Purchase Tickets</h3>

      <div className="border-b pb-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Ticket Price</span>
          <span className="font-medium">${price.toFixed(2)}/person</span>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="ticket-count" className="block text-sm font-medium mb-2">
          Number of Tickets
        </label>
        <div className="flex items-center">
          <button
            aria-label="Decrease ticket count"
            className="bg-gray-100 p-2 rounded-l-md border border-gray-300"
            type="button"
            onClick={handleDecrease}
            disabled={ticketCount <= 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M20 12H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>

          <input
            id="ticket-count"
            aria-label="Number of Tickets"
            type="number"
            value={ticketCount}
            className="p-2 w-12 text-center border-y border-gray-300"
            min={1}
            max={ticketsRemaining}
            readOnly
          />

          <button
            aria-label="Increase ticket count"
            className="bg-gray-100 p-2 rounded-r-md border border-gray-300"
            type="button"
            onClick={handleIncrease}
            disabled={ticketCount >= ticketsRemaining}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between mb-2 text-gray-600">
          <span>Service Fee</span>
          <span>${serviceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-medium mt-4">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleBuy}
        disabled={isPaymentProcessing}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-primary text-white hover:bg-primary/90 h-11 rounded-md px-8 w-full"
      >
        {isPaymentProcessing ? (
          <>
            <svg
              className="lucide lucide-loader-circle mr-2 h-4 w-4 animate-spin"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Processing...
          </>
        ) : (
          'Buy Ticket'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        By purchasing tickets, you agree to our Terms of Service and Privacy Policy. An invoice
        will be sent to your email.
      </p>
    </div>
  )
}

export default TicketPurchase
