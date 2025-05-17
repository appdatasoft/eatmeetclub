
import { useEffect, useState } from "react";
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
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
  
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

  const handleRefresh = async () => {
    if (isManuallyRefreshing) return; // Prevent multiple refreshes
    
    console.log("Manual refresh triggered");
    setIsManuallyRefreshing(true);
    
    toast({
      title: "Refreshing events",
      description: "Looking for new events..."
    });
    
    try {
      await refreshEvents();
    } finally {
      setIsManuallyRefreshing(false);
    }
  };

  // Calculate the effective loading state
  const effectiveLoading = isLoading || isManuallyRefreshing;

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

          {/* Display the events list conditionally */}
          <EventsList 
            events={effectiveLoading ? [] : filteredEvents} 
            isLoading={effectiveLoading} 
            error={fetchError} 
          />
          
          {/* Empty state - only show when data loaded successfully but no events found */}
          {!effectiveLoading && !fetchError && events.length === 0 && (
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
                  disabled={effectiveLoading}
                >
                  {effectiveLoading ? "Refreshing..." : "Refresh events"}
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
