
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { UserTicket } from '@/components/dashboard/tickets/types';

interface TicketResponse {
  id: string;
  event_id: string;
  quantity: number;
  price: number;
  purchase_date: string;
  payment_status: string;
  events: {
    title: string;
    date: string;
    restaurants: {
      name: string;
    } | null;
  };
}

const fetchUserTickets = async (userId: string): Promise<UserTicket[]> => {
  console.log("Fetching tickets for user:", userId);
  
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      id,
      event_id,
      quantity,
      price,
      purchase_date,
      payment_status,
      events!inner (
        title,
        date,
        restaurants (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .eq('payment_status', 'completed');

  if (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }

  console.log("Tickets fetched:", data);

  // Format the data for display
  return (data as unknown as TicketResponse[]).map((ticket) => ({
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

export const useUserTickets = (userId: string) => {
  return useQuery({
    queryKey: ['userTickets', userId],
    queryFn: () => fetchUserTickets(userId),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};
