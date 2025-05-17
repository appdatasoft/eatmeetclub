
import { useState, useEffect } from "react";
import EventCard, { EventCardProps } from "@/components/events/EventCard";
import useEvents from "@/hooks/events";
import { Skeleton } from "@/components/ui/skeleton";

const FeaturedEvents = () => {
  const { events, isLoading } = useEvents();
  const [featuredEvents, setFeaturedEvents] = useState<EventCardProps[]>([]);
  
  useEffect(() => {
    if (events.length > 0) {
      // Take up to 4 events for the featured section
      setFeaturedEvents(events.slice(0, 4));
    }
  }, [events]);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Featured Food Events</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover unique dining experiences at local restaurants. 
            From breakfast networking to gourmet dinners, there's something for every food lover.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm h-64 animate-pulse">
                <div className="h-32 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No featured events available at this time.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
