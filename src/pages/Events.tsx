
import { useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventFilters from "@/components/events/EventFilters";
import EventsList from "@/components/events/EventsList";
import useEvents from "@/hooks/events";
import useEventFilters from "@/hooks/useEventFilters";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Events = () => {
  const { events, isLoading, fetchError, refreshEvents } = useEvents();
  const { filters, filteredEvents, handleFilterChange } = useEventFilters(events);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Show toast for errors
  useEffect(() => {
    if (fetchError) {
      toast({
        title: "Error loading events",
        description: fetchError,
        variant: "destructive"
      });
      console.error("Events page error:", fetchError);
    }
  }, [fetchError, toast]);

  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    refreshEvents();
    toast({
      title: "Refreshing events",
      description: "Looking for new events..."
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-accent py-12">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Next Dining Event</h1>
                <p className="text-gray-600 max-w-2xl">
                  Browse through our curated selection of dining events. Connect with like-minded
                  individuals over breakfast, lunch, or dinner at top-rated local restaurants.
                </p>
              </div>
              {user && (
                <Button 
                  onClick={() => navigate("/dashboard/create-event")} 
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Event
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <EventFilters 
            filters={filters}
            onFilterChange={handleFilterChange} 
          />

          {/* Loading state */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="text-lg text-gray-600 mt-4">Loading events...</p>
            </div>
          )}

          {/* Error state */}
          {!isLoading && fetchError && (
            <div className="text-center py-8 bg-red-50 border border-red-100 rounded-lg p-4">
              <h3 className="text-lg font-medium text-red-800">Error loading events</h3>
              <p className="text-red-600 mt-2">{fetchError}</p>
              <Button 
                className="mt-4" 
                variant="outline"
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Events list - only render when not loading and no errors */}
          {!isLoading && !fetchError && (
            <EventsList 
              events={filteredEvents} 
              isLoading={false} 
              error={null} 
            />
          )}
          
          {/* Empty state - only show when data loaded successfully but no events found */}
          {!isLoading && !fetchError && events.length === 0 && (
            <div className="text-center mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
              <p className="text-lg text-gray-600">
                There are currently no published events available.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
                {user && (
                  <Button 
                    onClick={() => navigate("/dashboard/create-event")}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Create an event
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={handleRefresh}
                >
                  Refresh events
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Events;
