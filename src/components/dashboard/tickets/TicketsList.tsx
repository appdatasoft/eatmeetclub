
import React from 'react';
import { UserTicket } from './types';
import TicketItem from './TicketItem';

interface TicketsListProps {
  tickets: UserTicket[];
}

const TicketsList: React.FC<TicketsListProps> = ({ tickets }) => {
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};

export default TicketsList;
