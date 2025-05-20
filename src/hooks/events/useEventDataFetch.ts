
import { supabase } from "@/integrations/supabase/client";
import { EventDetails } from "@/types/event";

export const useEventDataFetch = () => {
  const fetchEventWithDetails = async (eventId: string): Promise<{
    event: EventDetails | null;
    error: string | null;
  }> => {
    try {
      console.log(`Fetching event details for ID: ${eventId}`);
      
      const { data, error } = await supabase
        .from("events")
        .select("*, restaurants(*)")
        .eq("id", eventId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching event from Supabase:", error.message);
        return { event: null, error: "Event not found or failed to fetch." };
      }

      if (!data) {
        return { event: null, error: "Event not found" };
      }

      const { ticketsSold, ticketsError } = await fetchTicketsSold(eventId);
      if (ticketsError) {
        console.warn("Ticket fetch warning:", ticketsError.message);
      }

      return {
        event: formatEventData(data, ticketsSold),
        error: null
      };
    } catch (err: any) {
      console.error("Unexpected error:", err.message);
      return { event: null, error: "Unexpected error occurred while loading event." };
    }
  };

  const fetchTicketsSold = async (eventId: string) => {
    const { data: ticketsData, error: ticketsError } = await supabase
      .from("tickets")
      .select("quantity")
      .eq("event_id", eventId)
      .eq("payment_status", "completed");

    let ticketsSold = 0;
    if (ticketsData?.length) {
      ticketsSold = ticketsData.reduce((total, t) => total + (t.quantity || 0), 0);
    }

    return { ticketsSold, ticketsError };
  };

  const formatEventData = (data: any, ticketsSold: number): EventDetails => {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return {
      ...data,
      date: formattedDate,
      tickets_sold: ticketsSold
    } as EventDetails;
  };

  return { fetchEventWithDetails };
};
