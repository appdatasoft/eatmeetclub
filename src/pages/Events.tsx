
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventFilters from "@/components/events/EventFilters";
import EventCard, { EventCardProps } from "@/components/events/EventCard";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface FilterState {
  category: string;
  date: string;
  price: string;
  location: string;
}

const Events = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchPublishedEvents = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        console.log("Fetching published events...");
        
        const { data, error } = await supabase
          .from('events')
          .select(`
            id, 
            title, 
            date, 
            time, 
            price, 
            capacity,
            cover_image,
            restaurant:restaurants(name, city, state)
          `)
          .eq('published', true)
          .order('date', { ascending: true });
          
        if (error) {
          console.error("Error fetching events:", error);
          setFetchError("Failed to load events. Please try again later.");
          setEvents([]);
          setFilteredEvents([]);
          return;
        }
        
        console.log("Events data received:", data);
        
        // Transform data to match EventCardProps format
        const formattedEvents: EventCardProps[] = (data || []).map((event: any) => {
          // Determine meal type based on time
          const eventTime = event.time;
          let category: "breakfast" | "lunch" | "dinner" = "dinner";
          
          if (eventTime) {
            const hour = parseInt(eventTime.split(':')[0]);
            if (hour < 11) {
              category = "breakfast";
            } else if (hour < 16) {
              category = "lunch";
            }
          }
          
          // Format date from YYYY-MM-DD to Month Day, Year
          let formattedDate = event.date;
          try {
            const dateObj = new Date(event.date);
            formattedDate = format(dateObj, "MMMM d, yyyy");
          } catch (e) {
            console.error("Error formatting date:", e);
          }
          
          // Format time from 24h to 12h format
          let formattedTime = event.time;
          try {
            const timeParts = event.time.split(':');
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            formattedTime = `${hours}:${minutes} ${ampm}`;
          } catch (e) {
            console.error("Error formatting time:", e);
          }
          
          const location = event.restaurant 
            ? `${event.restaurant.city}, ${event.restaurant.state}` 
            : "";
          
          return {
            id: event.id,
            title: event.title,
            restaurantName: event.restaurant ? event.restaurant.name : "Restaurant",
            date: formattedDate,
            time: formattedTime,
            price: event.price,
            image: event.cover_image || "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
            category,
            location
          };
        });
        
        console.log("Formatted events:", formattedEvents);
        setEvents(formattedEvents);
        setFilteredEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching published events:", error);
        setFetchError("An unexpected error occurred. Please try again later.");
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPublishedEvents();
  }, []);

  const handleFilterChange = (filters: FilterState) => {
    let results = [...events];

    // Apply category filter
    if (filters.category !== "all") {
      results = results.filter(
        (event) => event.category === filters.category
      );
    }

    // Apply date filter
    if (filters.date) {
      // This is a simple implementation. In a real app, you'd want to use a date library
      // to properly compare dates, taking into account formatting differences
      results = results.filter((event) =>
        event.date.toLowerCase().includes(filters.date.toLowerCase())
      );
    }

    // Apply price filter
    if (filters.price) {
      const [min, max] = filters.price.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        results = results.filter(
          (event) => event.price >= min && event.price <= max
        );
      } else if (!isNaN(min) && filters.price.includes("+")) {
        results = results.filter((event) => event.price >= min);
      }
    }

    // Apply location filter
    if (filters.location) {
      results = results.filter((event) =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredEvents(results);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-accent py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Next Dining Event</h1>
            <p className="text-gray-600 max-w-2xl">
              Browse through our curated selection of dining events. Connect with like-minded
              individuals over breakfast, lunch, or dinner at top-rated local restaurants.
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          <EventFilters onFilterChange={handleFilterChange} />

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-red-600 mb-2">Error</h3>
              <p className="text-gray-700">{fetchError}</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later for upcoming events.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
