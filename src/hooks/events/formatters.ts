
import { format, parse } from "date-fns";

export const formatEventDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  } catch (e) {
    console.error('Error formatting date:', dateString, e);
    return dateString;
  }
};

export const formatEventTime = (timeString: string): string => {
  try {
    // Parse the time string to a date object
    const timeDate = parse(timeString, 'HH:mm:ss', new Date());
    return format(timeDate, 'h:mm a');
  } catch (e) {
    console.error('Error formatting time:', timeString, e);
    return timeString;
  }
};

export const getCategoryFromTime = (timeString: string): "breakfast" | "lunch" | "dinner" => {
  try {
    const hour = parseInt(timeString.split(':')[0], 10);
    
    if (hour < 11) return "breakfast";
    if (hour < 16) return "lunch";
    return "dinner";
  } catch (e) {
    console.error('Error determining category from time:', timeString, e);
    return "dinner"; // Default fallback
  }
};
