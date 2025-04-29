
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventFilters from "@/components/events/EventFilters";
import EventsList from "@/components/events/EventsList";
import useEvents from "@/hooks/useEvents";
import useEventFilters from "@/hooks/useEventFilters";
import { useToast } from "@/hooks/use-toast";

const Events = () => {
  const { events, isLoading, fetchError, refreshEvents } = useEvents();
  const { filters, filteredEvents, handleFilterChange } = useEventFilters(events);
  const { toast } = useToast();
  
  // Show toast for errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Error loading events",
        description: fetchError,
        variant: "destructive"
      });
    }
  }, [fetchError, toast]);

  // For debugging
  useEffect(() => {
    console.log("Events page - loaded events:", events.length, "filtered events:", filteredEvents.length);
  }, [events, filteredEvents]);

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
          <EventFilters 
            filters={filters}
            onFilterChange={handleFilterChange} 
          />

          <EventsList 
            events={filteredEvents} 
            isLoading={isLoading} 
            error={fetchError} 
          />
          
          {!isLoading && events.length === 0 && !fetchError && (
            <div className="text-center mt-8">
              <p className="text-lg text-gray-600">
                There are currently no published events available.
              </p>
              <button 
                className="mt-4 text-blue-600 hover:text-blue-800 underline"
                onClick={() => refreshEvents()}
              >
                Refresh events
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
