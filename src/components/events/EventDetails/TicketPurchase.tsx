
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useReferralTracking } from "@/hooks/useReferralTracking";

interface EventType {
  id: string;
  title: string;
  price: number;
}

export interface TicketPurchaseProps {
  event?: EventType;
  eventId?: string;
  ticketPrice?: number;
  ticketsRemaining: number;
  ticketsPercentage?: number;
  isProcessing: boolean;
  handleTicketPurchase?: (count: number) => void;
  onPurchase?: (count: number) => void;
  referralCode?: string | null;
}

export const TicketPurchase = ({
  event,
  eventId,
  ticketPrice,
  ticketsRemaining,
  ticketsPercentage = 0,
  isProcessing,
  handleTicketPurchase,
  onPurchase,
  referralCode: propReferralCode,
}: TicketPurchaseProps) => {
  const [ticketCount, setTicketCount] = useState(1);
  
  // Get values from either props pattern
  const effectiveEventId = event?.id || eventId || '';
  const effectivePrice = event?.price || ticketPrice || 0;
  
  // Use either the hook or the passed prop for referral code
  const { getStoredReferralCode } = useReferralTracking(effectiveEventId);
  const activeReferralCode = propReferralCode || getStoredReferralCode?.(effectiveEventId);

  const decreaseCount = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const increaseCount = () => {
    if (ticketCount < Math.min(10, ticketsRemaining)) {
      setTicketCount(ticketCount + 1);
    }
  };

  const onPurchaseClick = () => {
    // Use whichever function is provided
    if (handleTicketPurchase) {
      handleTicketPurchase(ticketCount);
    } else if (onPurchase) {
      onPurchase(ticketCount);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Tickets</CardTitle>
        <CardDescription>
          {ticketsRemaining > 0
            ? `${ticketsRemaining} tickets remaining`
            : "Sold Out"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar showing tickets sold */}
        <div className="w-full bg-muted rounded-full h-2.5 mb-4">
          <div
            className="bg-primary h-2.5 rounded-full"
            style={{ width: `${ticketsPercentage}%` }}
          ></div>
        </div>

        {ticketsRemaining > 0 ? (
          <>
            <div className="flex justify-between items-center my-4">
              <span className="text-lg font-bold">
                ${effectivePrice.toFixed(2)} / ticket
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseCount}
                  disabled={ticketCount <= 1 || isProcessing}
                  aria-label="Decrease ticket count"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold" aria-label="Number of tickets">{ticketCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseCount}
                  disabled={
                    ticketCount >= Math.min(10, ticketsRemaining) || isProcessing
                  }
                  aria-label="Increase ticket count"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Service fee calculation */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Price ({ticketCount} tickets)</span>
                <span>${(effectivePrice * ticketCount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>${(effectivePrice * ticketCount * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t pt-1 mt-1 flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>
                  ${(effectivePrice * ticketCount * 1.05).toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Show referral indicator if came from affiliate link */}
            {activeReferralCode && (
              <div className="text-xs text-muted-foreground mt-2 text-center bg-muted py-1 rounded-md">
                You were referred by a friend
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-2 text-muted-foreground">
            This event is currently sold out.
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onPurchaseClick}
          className="w-full"
          disabled={ticketsRemaining <= 0 || isProcessing}
        >
          {isProcessing
            ? "Processing..."
            : ticketsRemaining > 0
            ? `Buy ${ticketCount} ${ticketCount === 1 ? "Ticket" : "Tickets"}`
            : "Sold Out"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketPurchase;
