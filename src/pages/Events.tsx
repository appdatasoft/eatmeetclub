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
import { Calendar, Plus, RefreshCw, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ConnectionStatusBanner } from "@/components/ui/ConnectionStatusBanner";
import { RetryAlert } from "@/components/ui/RetryAlert";
import { ConnectionIssueHelper } from "@/components/ui/ConnectionIssueHelper";

const Events = () => {
  const { events, isLoading, fetchError, refreshEvents, hasSubscriptionError } = useEvents();
  const { filters, filteredEvents, handleFilterChange } = useEventFilters(events);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isManuallyRefreshing, setIsManuallyRefreshing] = useState(false);
  const [showDetailedHelp, setShowDetailedHelp] = useState(false);
  
  // Check if the error is related to API key
  const isApiKeyError = fetchError?.includes('Invalid API key') || 
                        fetchError?.includes('401') ||
                        fetchError?.includes('Unauthorized');
  
  // Show toast for errors - only once per error
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
    if (isManuallyRefreshing || isLoading) return; // Prevent multiple refreshes
    
    console.log("Manual refresh triggered");
    setIsManuallyRefreshing(true);
    
    toast({
      title: "Refreshing events",
      description: "Looking for new events..."
    });
    
    try {
      await refreshEvents();
    } finally {
      // Add a small delay before removing loading state to avoid flickering
      setTimeout(() => {
        if (isManuallyRefreshing) {
          setIsManuallyRefreshing(false);
        }
      }, 500);
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
          {/* API Key Error Helper - show expanded help if requested */}
          {isApiKeyError && showDetailedHelp ? (
            <ConnectionIssueHelper 
              errorMessage={fetchError || undefined}
              onRetry={handleRefresh}
              isRetrying={isManuallyRefreshing}
            />
          ) : (
            <>
              {/* Connection status banner that shows on error or when live updates fail */}
              <ConnectionStatusBanner onManualRefresh={refreshEvents} />
              
              {/* Show a specific error for API key issues */}
              {isApiKeyError && !showDetailedHelp && (
                <div className="mb-4">
                  <RetryAlert 
                    severity="error"
                    title="API Key Error"
                    message="The application can't connect to Supabase due to an invalid API key."
                    onRetry={handleRefresh}
                    isRetrying={isManuallyRefreshing}
                    isApiKeyError={true}
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="link" 
                      onClick={() => setShowDetailedHelp(true)}
                      className="text-amber-700 text-sm"
                    >
                      Show more detailed help
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Show a warning if real-time updates are unavailable but not due to API key issue */}
              {hasSubscriptionError && !fetchError && !isApiKeyError && (
                <RetryAlert 
                  severity="info"
                  title="Real-time Updates Unavailable"
                  message="Event updates will automatically refresh periodically. You can also refresh manually."
                  onRetry={handleRefresh}
                  isRetrying={isManuallyRefreshing}
                />
              )}
            </>
          )}
          
          <EventFilters 
            filters={filters}
            onFilterChange={handleFilterChange} 
          />

          {/* Add manual refresh button above the events list */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={effectiveLoading}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${effectiveLoading ? 'animate-spin' : ''}`} />
              {effectiveLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

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
