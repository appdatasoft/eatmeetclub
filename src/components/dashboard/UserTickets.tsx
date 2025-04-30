
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

interface UserTicket {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  restaurant_name: string;
  quantity: number;
  price: number;
  purchase_date: string;
}

const fetchUserTickets = async (userId: string) => {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      event_id,
      quantity,
      price,
      purchase_date,
      events!inner (
        title,
        date,
        restaurants (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .eq('payment_status', 'completed')
    .order('purchase_date', { ascending: false });

  if (error) throw error;

  // Format the data for display
  return data.map((ticket) => ({
    id: ticket.id,
    event_id: ticket.event_id,
    event_title: ticket.events.title,
    event_date: new Date(ticket.events.date).toLocaleDateString(),
    restaurant_name: ticket.events.restaurants?.name || 'Unknown venue',
    quantity: ticket.quantity,
    price: ticket.price,
    purchase_date: new Date(ticket.purchase_date).toLocaleDateString(),
  }));
};

interface UserTicketsProps {
  userId: string;
}

const UserTickets: React.FC<UserTicketsProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['userTickets', userId],
    queryFn: () => fetchUserTickets(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="mr-2 h-5 w-5" />
            My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    toast({
      title: "Error loading tickets",
      description: "Failed to load your tickets. Please try again.",
      variant: "destructive",
    });
    
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ticket className="mr-2 h-5 w-5" />
            My Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center">
            <p className="text-muted-foreground">Failed to load tickets.</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id}
                className="border rounded-lg p-4 hover:bg-accent cursor-pointer"
                onClick={() => navigate(`/event/${ticket.event_id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{ticket.event_title}</h3>
                    <p className="text-sm text-muted-foreground">{ticket.restaurant_name}</p>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {ticket.quantity} {ticket.quantity === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Event date: {ticket.event_date}</span>
                  <span>Purchased: {ticket.purchase_date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't purchased any tickets yet.</p>
            <Button onClick={() => navigate('/events')}>Browse Events</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTickets;
