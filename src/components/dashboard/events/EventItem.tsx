
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Link } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Event } from "./types";
import EventStatusBadge, { PublishedBadge } from "./EventStatusBadge";
import EventActionButtons from "./EventActionButtons";
import EventTicketsCollapsible from "./EventTickets/EventTicketsCollapsible";
import { useEventTickets } from "./hooks/useEventTickets";

interface EventItemProps {
  event: Event;
  onRefresh?: () => void;
}

const EventItem = ({ event, onRefresh }: EventItemProps) => {
  const navigate = useNavigate();
  const { eventTickets, ticketsLoading, fetchTicketsForEvent } = useEventTickets();
  
  const formatEventDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <span 
          className="cursor-pointer text-primary hover:underline flex items-center"
          onClick={() => handleEventClick(event.id)}
        >
          {event.title}
          <Link className="ml-1 h-3 w-3" />
        </span>
        {event.published && (
          <PublishedBadge className="ml-2" />
        )}
      </TableCell>
      <TableCell>{event.restaurant?.name || 'Unknown'}</TableCell>
      <TableCell>{formatEventDate(event.date)}</TableCell>
      <TableCell>${event.price.toFixed(2)}</TableCell>
      <TableCell>
        <EventStatusBadge paymentStatus={event.payment_status} />
      </TableCell>
      <TableCell>
        <EventTicketsCollapsible 
          event={event}
          eventTickets={eventTickets}
          ticketsLoading={ticketsLoading}
          onFetchTickets={fetchTicketsForEvent}
        />
      </TableCell>
      <TableCell>
        <EventActionButtons event={event} onRefresh={onRefresh} />
      </TableCell>
    </TableRow>
  );
};

export default EventItem;
