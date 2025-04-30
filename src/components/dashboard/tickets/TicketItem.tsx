
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserTicket } from './types';

interface TicketItemProps {
  ticket: UserTicket;
}

const TicketItem: React.FC<TicketItemProps> = ({ ticket }) => {
  const navigate = useNavigate();
  
  return (
    <div 
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
  );
};

export default TicketItem;
