
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

  // For debugging
  useEffect(() => {
    console.log("Events page - Current auth state:", user ? "Logged in" : "Not logged in");
    console.log("Events page - Raw events count:", events.length);
    console.log("Events page - Filtered events count:", filteredEvents.length);
    
    if (events.length === 0 && !isLoading) {
      console.log("No events found. This might indicate an issue with data access or RLS policies.");
    }
    
    if (events.length > 0) {
      console.log("Sample event data:", events[0]);
    }
  }, [events, filteredEvents, user, isLoading]);

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

          {isLoading && (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">Loading events...</p>
            </div>
          )}

          {fetchError && (
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

          {!isLoading && !fetchError && (
            <EventsList 
              events={filteredEvents} 
              isLoading={isLoading} 
              error={fetchError} 
            />
          )}
          
          {!isLoading && events.length === 0 && !fetchError && (
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
              <div className="mt-6 p-4 bg-gray-50 rounded text-left">
                <p className="font-medium text-gray-800 mb-2">Debug Information:</p>
                <ul className="text-sm space-y-1 text-gray-500">
                  <li>Authentication: {user ? `User logged in (${user.id.slice(0,6)}...)` : "No user logged in"}</li>
                  <li>Raw events count: {events.length}</li>
                  <li>Filtered events count: {filteredEvents.length}</li>
                </ul>
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
