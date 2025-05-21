
import { RawEventData } from "./eventsApi";
import { EventCardProps } from "@/components/events/EventCard";
import { formatEventDate, formatEventTime, getCategoryFromTime } from "./formatters";
import { addCacheBuster } from "@/utils/supabaseStorage";

export const mapToEventCardProps = (rawEvents: RawEventData[]): EventCardProps[] => {
  if (!Array.isArray(rawEvents) || rawEvents.length === 0) {
    console.log("No raw events to map");
    return [];
  }
  
  return rawEvents.map(event => {
    const dateFormatted = formatEventDate(event.date);
    const timeFormatted = formatEventTime(event.time || "19:00:00");
    const category = getCategoryFromTime(event.time || "19:00:00");
    
    // Use the event's cover image directly from storage - no fallback to Unsplash
    let eventImage = event.cover_image || "";
    
    // Add cache buster to avoid caching issues
    if (eventImage) {
      eventImage = addCacheBuster(eventImage);
    } else {
      console.log(`No cover image found for event: ${event.id} - ${event.title}`);
      // Use a simple SVG placeholder instead of Unsplash
      eventImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23888'%3ENo Image%3C/text%3E%3C/svg%3E";
    }
    
    // Safely access restaurant data with TypeScript type guards
    let restaurantName = "Restaurant name not available";
    if (event.restaurants) {
      // Direct access to name property if it's a simple object
      if (typeof event.restaurants === 'object' && !Array.isArray(event.restaurants) && event.restaurants.name) {
        restaurantName = event.restaurants.name;
      }
      // Handle possible array structure (shouldn't normally happen but just in case)
      else if (Array.isArray(event.restaurants) && event.restaurants.length > 0 && 
              typeof event.restaurants[0] === 'object' && event.restaurants[0] !== null &&
              'name' in event.restaurants[0]) {
        restaurantName = event.restaurants[0].name || "Restaurant name not available";
      }
    }
    
    // Safely access location data
    let location = "Location not available";
    if (event.restaurants) {
      let city = "Unknown city";
      let state = "";
      
      // Handle object form
      if (typeof event.restaurants === 'object' && !Array.isArray(event.restaurants)) {
        city = event.restaurants.city || "Unknown city";
        state = event.restaurants.state ? `, ${event.restaurants.state}` : "";
      }
      // Handle array form (shouldn't normally happen)
      else if (Array.isArray(event.restaurants) && event.restaurants.length > 0 &&
              typeof event.restaurants[0] === 'object' && event.restaurants[0] !== null) {
        city = event.restaurants[0].city || "Unknown city";
        state = event.restaurants[0].state ? `, ${event.restaurants[0].state}` : "";
      }
      
      location = `${city}${state}`;
    }
    
    return {
      id: event.id,
      title: event.title,
      restaurantName,
      restaurantId: event.restaurant_id,
      date: dateFormatted,
      time: timeFormatted,
      price: parseFloat(event.price.toString()),
      image: eventImage,
      category,
      location,
      userId: event.user_id
    };
  });
};
