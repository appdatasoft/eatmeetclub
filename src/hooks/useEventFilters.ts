
import { useState, useEffect, useCallback } from "react";
import { EventCardProps } from "@/components/events/EventCard";

export interface FilterState {
  category: string;
  date: string;
  price: string;
  location: string;
}

export const useEventFilters = (allEvents: EventCardProps[]) => {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    date: "",
    price: "",
    location: "",
  });
  
  const [filteredEvents, setFilteredEvents] = useState<EventCardProps[]>([]);

  const handleFilterChange = useCallback((key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters, allEvents);
  }, [filters, allEvents]);

  const applyFilters = useCallback((currentFilters: FilterState, events: EventCardProps[]) => {
    let results = [...events];

    // Apply category filter
    if (currentFilters.category !== "all") {
      results = results.filter(
        (event) => event.category === currentFilters.category
      );
    }

    // Apply date filter
    if (currentFilters.date) {
      // This is a simple implementation. In a real app, you'd want to use a date library
      // to properly compare dates, taking into account formatting differences
      results = results.filter((event) =>
        event.date.toLowerCase().includes(currentFilters.date.toLowerCase())
      );
    }

    // Apply price filter
    if (currentFilters.price) {
      const [min, max] = currentFilters.price.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        results = results.filter(
          (event) => event.price >= min && event.price <= max
        );
      } else if (!isNaN(min) && currentFilters.price.includes("+")) {
        results = results.filter((event) => event.price >= min);
      }
    }

    // Apply location filter
    if (currentFilters.location) {
      results = results.filter((event) =>
        event.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }

    console.log(`Filtered events: ${results.length} of ${events.length} total events`);
    setFilteredEvents(results);
  }, []);

  // Update filtered events when allEvents changes
  useEffect(() => {
    if (allEvents && allEvents.length > 0) {
      applyFilters(filters, allEvents);
    } else {
      setFilteredEvents([]);
    }
  }, [allEvents, filters, applyFilters]);

  return {
    filters,
    filteredEvents,
    handleFilterChange
  };
};

export default useEventFilters;
