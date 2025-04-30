
import { Ticket } from "./types";

interface EventTicketsProps {
  tickets: Ticket[];
  isLoading: boolean;
}

const EventTickets = ({ tickets, isLoading }: EventTicketsProps) => {
  if (isLoading) {
    return (
      <div className="py-3 text-center">
        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        <span className="ml-2 text-sm text-gray-500">Loading tickets...</span>
      </div>
    );
  }
  
  if (tickets.length === 0) {
    return (
      <div className="py-2 text-sm text-gray-500 text-center">
        No tickets sold yet
      </div>
    );
  }
  
  return (
    <div className="text-sm">
      <div className="font-medium mb-1">Ticket Purchasers:</div>
      <ul className="space-y-1">
        {tickets.map((ticket) => (
          <li key={ticket.id} className="flex justify-between">
            <span className="text-gray-700">{ticket.user_email || 'Anonymous'}</span>
            <span className="text-gray-500">
              {ticket.quantity} {ticket.quantity > 1 ? 'tickets' : 'ticket'} • {ticket.purchase_date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventTickets;
