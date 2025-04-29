
import { useState, useEffect, useCallback } from "react";
import { EventCardProps } from "@/components/events/EventCard";

export interface FilterState {
  category: string;
  date: string;
  price: string;
  location: string;
}

export const useEventFilters = (allEvents: EventCardProps[] = []) => {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    date: "",
    price: "",
    location: "",
  });
  
  const [filteredEvents, setFilteredEvents] = useState<EventCardProps[]>([]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    console.log(`Filter changed: ${key} to ${value}`);
    setFilters(newFilters);
  }, [filters]);

  // Apply filters whenever filters state or allEvents change
  useEffect(() => {
    if (!allEvents || allEvents.length === 0) {
      setFilteredEvents([]);
      return;
    }

    console.log(`Applying filters to ${allEvents.length} events:`, filters);
    let results = [...allEvents];

    // Apply category filter
    if (filters.category !== "all") {
      results = results.filter(event => event.category === filters.category);
      console.log(`After category filter (${filters.category}): ${results.length} events`);
    }

    // Apply date filter
    if (filters.date) {
      // Convert filter date to YYYY-MM-DD for comparison
      const filterDateStr = filters.date;
      
      results = results.filter(event => {
        // Try to match the date string directly
        if (event.date.includes(filterDateStr)) {
          return true;
        }
        
        // If that fails, try to parse and compare dates
        try {
          // Parse the displayed date back to a comparable format
          const eventDateParts = event.date.split(" ");
          // This is a rough conversion and might need adjusting
          const eventMonth = eventDateParts[0];
          const eventDay = parseInt(eventDateParts[1].replace(",", ""));
          const eventYear = parseInt(eventDateParts[2]);
          
          // Parse the filter date
          const filterDate = new Date(filterDateStr);
          const filterMonth = filterDate.toLocaleString('default', { month: 'long' });
          const filterDay = filterDate.getDate();
          const filterYear = filterDate.getFullYear();
          
          // Compare the date parts
          return (
            eventMonth === filterMonth && 
            eventDay === filterDay && 
            eventYear === filterYear
          );
        } catch (error) {
          console.error("Error comparing dates:", error);
          return false;
        }
      });
      
      console.log(`After date filter (${filters.date}): ${results.length} events`);
    }

    // Apply price filter
    if (filters.price) {
      if (filters.price.includes("-")) {
        const [min, max] = filters.price.split("-").map(Number);
        results = results.filter(event => event.price >= min && event.price <= max);
      } else if (filters.price.includes("+")) {
        const min = parseInt(filters.price);
        results = results.filter(event => event.price >= min);
      }
      
      console.log(`After price filter (${filters.price}): ${results.length} events`);
    }

    // Apply location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      results = results.filter(event => 
        event.location.toLowerCase().includes(locationLower)
      );
      
      console.log(`After location filter (${filters.location}): ${results.length} events`);
    }

    console.log(`Final filtered events: ${results.length} of ${allEvents.length} total events`);
    setFilteredEvents(results);
  }, [filters, allEvents]);

  return {
    filters,
    filteredEvents,
    handleFilterChange
  };
};

export default useEventFilters;
