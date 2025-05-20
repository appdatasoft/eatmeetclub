
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useReferralTracking } from "@/hooks/useReferralTracking";

interface TicketPurchaseProps {
  event: {
    id: string;
    title: string;
    price: number;
  };
  ticketsRemaining: number;
  ticketsPercentage: number;
  handleTicketPurchase: (count: number) => void;
  isProcessing: boolean;
}

export const TicketPurchase = ({
  event,
  ticketsRemaining,
  ticketsPercentage,
  handleTicketPurchase,
  isProcessing,
}: TicketPurchaseProps) => {
  const [ticketCount, setTicketCount] = useState(1);
  const { referralCode } = useReferralTracking(event.id);

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

  const onPurchase = () => {
    handleTicketPurchase(ticketCount);
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
                ${event.price.toFixed(2)} / ticket
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={decreaseCount}
                  disabled={ticketCount <= 1 || isProcessing}
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <span className="text-lg font-semibold">{ticketCount}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={increaseCount}
                  disabled={
                    ticketCount >= Math.min(10, ticketsRemaining) || isProcessing
                  }
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Service fee calculation */}
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Price ({ticketCount} tickets)</span>
                <span>${(event.price * ticketCount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service fee</span>
                <span>${(event.price * ticketCount * 0.05).toFixed(2)}</span>
              </div>
              <div className="border-t pt-1 mt-1 flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>
                  ${(event.price * ticketCount * 1.05).toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Show referral indicator if came from affiliate link */}
            {referralCode && (
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
          onClick={onPurchase}
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
