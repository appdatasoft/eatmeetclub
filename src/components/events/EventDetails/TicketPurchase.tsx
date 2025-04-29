
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface TicketPurchaseProps {
  price: number;
  ticketsRemaining: number;
  onBuyTickets: (quantity: number) => void;
  isPaymentProcessing: boolean;
  isLoggedIn?: boolean;
}

const TicketPurchase: React.FC<TicketPurchaseProps> = ({ 
  price, 
  ticketsRemaining,
  onBuyTickets,
  isPaymentProcessing,
  isLoggedIn = true
}) => {
  const [ticketCount, setTicketCount] = useState(1);

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
            type="button"
            onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
            className="bg-gray-100 p-2 rounded-l-md border border-gray-300"
            disabled={ticketCount <= 1 || isPaymentProcessing}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <input
            type="number"
            id="ticket-count"
            value={ticketCount}
            onChange={(e) => setTicketCount(Math.max(1, Math.min(ticketsRemaining, parseInt(e.target.value) || 1)))}
            min="1"
            max={ticketsRemaining}
            className="p-2 w-12 text-center border-y border-gray-300"
            disabled={isPaymentProcessing}
          />
          <button
            type="button"
            onClick={() => setTicketCount(Math.min(ticketsRemaining, ticketCount + 1))}
            className="bg-gray-100 p-2 rounded-r-md border border-gray-300"
            disabled={ticketCount >= ticketsRemaining || isPaymentProcessing}
          >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span>${(price * ticketCount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Service Fee</span>
          <span>${(price * ticketCount * 0.05).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center font-medium text-lg mt-4">
          <span>Total</span>
          <span>${(price * ticketCount * 1.05).toFixed(2)}</span>
        </div>
      </div>
      
      {!isLoggedIn ? (
        <div>
          <Button 
            onClick={() => onBuyTickets(ticketCount)} 
            className="w-full mb-2" 
            size="lg"
          >
            Log in to Buy Tickets
          </Button>
          <div className="text-center mt-2">
            <Link to="/become-member" className="text-primary hover:underline">
              Not a member? Join now to buy tickets
            </Link>
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => onBuyTickets(ticketCount)} 
          className="w-full" 
          size="lg"
          disabled={isPaymentProcessing}
        >
          {isPaymentProcessing ? "Processing..." : `Buy Ticket${ticketCount > 1 ? 's' : ''}`}
        </Button>
      )}
      
      <p className="text-xs text-gray-500 text-center mt-4">
        By purchasing tickets, you agree to our Terms of Service and Privacy Policy. An invoice will be sent to your email.
      </p>
    </div>
  );
};

export default TicketPurchase;
