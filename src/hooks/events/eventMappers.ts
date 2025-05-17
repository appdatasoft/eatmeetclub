
import { RawEventData } from "./eventsApi";
import { EventCardProps } from "@/components/events/EventCard";
import { formatEventDate, formatEventTime, getCategoryFromTime } from "./formatters";

export const mapToEventCardProps = (rawEvents: RawEventData[]): EventCardProps[] => {
  if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
    console.log("No raw events to map");
    return [];
  }
  
  return rawEvents.map(event => {
    const dateFormatted = formatEventDate(event.date);
    const timeFormatted = formatEventTime(event.time || "19:00:00");
    const category = getCategoryFromTime(event.time || "19:00:00");
    
    const defaultImage = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60";
    
    const restaurantName = event.restaurant?.name || "Restaurant name not available";
    const location = event.restaurant ? 
      `${event.restaurant.city || "Unknown city"}${event.restaurant.state ? `, ${event.restaurant.state}` : ""}` : 
      "Location not available";
    
    return {
      id: event.id,
      title: event.title,
      restaurantName,
      restaurantId: event.restaurant_id,
      date: dateFormatted,
      time: timeFormatted,
      price: parseFloat(event.price.toString()),
      image: event.cover_image || defaultImage,
      category,
      location,
      userId: event.user_id
    };
  });
};
