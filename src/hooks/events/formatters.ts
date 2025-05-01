
import { format } from "date-fns";
import { EventCardProps } from "@/components/events/EventCard";

export const formatEventDate = (dateString: string): string => {
  try {
    const dateObj = new Date(dateString);
    return format(dateObj, "MMMM d, yyyy");
  } catch (e) {
    console.error("Error formatting date:", e, "for date:", dateString);
    return dateString;
  }
};

export const formatEventTime = (timeString: string | undefined): string => {
  if (!timeString) return "";
  
  try {
    const timeParts = timeString.split(':');
    let hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  } catch (e) {
    console.error("Error formatting time:", e, "for time:", timeString);
    return timeString;
  }
};

export const determineMealCategory = (timeString: string | undefined): "breakfast" | "lunch" | "dinner" => {
  if (!timeString) return "dinner";
  
  try {
    const hour = parseInt(timeString.split(':')[0]);
    if (hour < 11) {
      return "breakfast";
    } else if (hour < 16) {
      return "lunch";
    }
    return "dinner";
  } catch (e) {
    console.error("Error determining meal category:", e);
    return "dinner";
  }
};
