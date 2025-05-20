
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Loader2 } from "lucide-react";

interface TicketPurchaseProps {
  eventId: string;
  ticketPrice: number;
  ticketsRemaining: number;
  isProcessing?: boolean;
  onPurchase?: (ticketCount: number) => void;
  referralCode?: string | null;
}

export const TicketPurchase: React.FC<TicketPurchaseProps> = ({
  eventId,
  ticketPrice,
  ticketsRemaining,
  isProcessing = false,
  onPurchase,
  referralCode
}) => {
  const [ticketCount, setTicketCount] = useState(1);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleIncrement = () => {
    if (ticketCount < ticketsRemaining && ticketCount < 10) {
      setTicketCount(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (ticketCount > 1) {
      setTicketCount(prev => prev - 1);
    }
  };

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(ticketCount);
      
      // Log purchase with referral for debugging
      if (referralCode) {
        console.log(`Purchase initiated with referral code: ${referralCode}`);
      }
    }
  };

  const totalCost = ticketPrice * ticketCount;
  const serviceFee = totalCost * 0.05; // 5% service fee
  const finalTotal = totalCost + serviceFee;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
      <h3 className="text-xl font-semibold mb-4">Get Tickets</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Price per ticket:</span>
          <span>{formatCurrency(ticketPrice)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <span>Tickets:</span>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleDecrement}
                disabled={ticketCount <= 1 || isProcessing}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center">{ticketCount}</span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={handleIncrement}
                disabled={ticketCount >= ticketsRemaining || ticketCount >= 10 || isProcessing}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Ticket Cost:</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee:</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mb-4">
          {ticketsRemaining > 0 ? (
            <span>Only {ticketsRemaining} tickets remaining!</span>
          ) : (
            <span className="text-red-500">Sold out!</span>
          )}
        </div>
        
        {referralCode && (
          <div className="text-xs text-blue-600 mb-4 bg-blue-50 p-2 rounded">
            Referral code applied: {referralCode}
          </div>
        )}
      </div>
      
      <Button 
        className="w-full" 
        onClick={handlePurchase}
        disabled={ticketsRemaining === 0 || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Buy Tickets (${ticketCount})`
        )}
      </Button>
      
      <p className="text-center text-xs text-gray-500 mt-4">
        Secure payment processing with Stripe
      </p>
    </div>
  );
};

export default TicketPurchase;
