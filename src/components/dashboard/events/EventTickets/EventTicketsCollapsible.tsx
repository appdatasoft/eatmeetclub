
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Event, Ticket } from "../types";
import EventTickets from "../EventTickets";

interface EventTicketsCollapsibleProps {
  event: Event;
  eventTickets: Ticket[];
  ticketsLoading: boolean;
  onFetchTickets: (eventId: string) => Promise<void>;
}

const EventTicketsCollapsible = ({ 
  event, 
  eventTickets, 
  ticketsLoading,
  onFetchTickets 
}: EventTicketsCollapsibleProps) => {
  if (!event.published) {
    return <span className="text-gray-400 text-sm">Not published</span>;
  }

  return (
    <Collapsible 
      className="w-full"
      onOpenChange={() => event.published && onFetchTickets(event.id)}
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 h-auto flex items-center text-primary font-medium"
        >
          <span className="font-bold">{event.tickets_sold || 0}</span>
          <span className="text-xs ml-1">/{event.capacity}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="border rounded-md mt-2 p-2 bg-slate-50">
        <EventTickets 
          tickets={eventTickets}
          isLoading={ticketsLoading}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EventTicketsCollapsible;
