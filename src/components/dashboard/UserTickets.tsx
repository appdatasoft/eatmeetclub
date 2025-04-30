
import React, { useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserTickets } from "@/hooks/useUserTickets";
import LoadingTickets from './tickets/LoadingTickets';
import ErrorTickets from './tickets/ErrorTickets';
import EmptyTickets from './tickets/EmptyTickets';
import TicketsList from './tickets/TicketsList';
import { UserTicketsProps } from './tickets/types';

const UserTickets: React.FC<UserTicketsProps> = ({ userId }) => {
  const { toast } = useToast();
  
  const { data: tickets, isLoading, error, refetch } = useUserTickets(userId);

  useEffect(() => {
    console.log("UserTickets component rendered with userId:", userId);
    console.log("Tickets data:", tickets);
    
    // Initial load check for tickets
    if (!isLoading && !error && (!tickets || tickets.length === 0)) {
      console.log("No tickets found on initial load");
    }
  }, [userId, tickets, isLoading, error]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Error in UserTickets:", error);
      toast({
        title: "Error loading tickets",
        description: "Failed to load your tickets. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return <LoadingTickets />;
  }

  if (error) {
    return <ErrorTickets onRetry={() => refetch()} />;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Ticket className="mr-2 h-5 w-5" />
          My Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tickets && tickets.length > 0 ? (
          <TicketsList tickets={tickets} />
        ) : (
          <EmptyTickets />
        )}
      </CardContent>
    </Card>
  );
};

export default UserTickets;
