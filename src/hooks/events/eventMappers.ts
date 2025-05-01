
import { EventCardProps } from "@/components/events/EventCard";
import { RawEventData } from "./eventsApi";
import { formatEventDate, formatEventTime, determineMealCategory } from "./formatters";

export const mapToEventCardProps = (events: RawEventData[]): EventCardProps[] => {
  console.log("Mapping raw events to EventCardProps...");
  
  return events.map((event: RawEventData) => {
    // Format date from YYYY-MM-DD to Month Day, Year
    const formattedDate = formatEventDate(event.date);
    
    // Format time from 24h to 12h format
    const formattedTime = formatEventTime(event.time);
    
    // Determine meal type based on time
    const category = determineMealCategory(event.time);
    
    const location = event.restaurant 
      ? `${event.restaurant.city || ""}, ${event.restaurant.state || ""}` 
      : "";
      
    const eventProps: EventCardProps = {
      id: event.id,
      title: event.title || "Untitled Event",
      restaurantName: event.restaurant ? event.restaurant.name : "Restaurant",
      restaurantId: event.restaurant_id,
      date: formattedDate,
      time: formattedTime,
      price: Number(event.price) || 0,
      image: event.cover_image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
      category,
      location,
      userId: event.user_id
    };
    
    return eventProps;
  });
};
