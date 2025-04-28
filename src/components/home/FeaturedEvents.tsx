
import { useState, useEffect } from "react";
import EventCard, { EventCardProps } from "@/components/events/EventCard";

// Mock data for featured events
const mockEvents: EventCardProps[] = [
  {
    id: "1",
    title: "Farm-to-Table Dinner Experience",
    restaurantName: "Harvest Table",
    date: "April 30, 2025",
    time: "7:00 PM",
    price: 65,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    category: "dinner",
    location: "San Francisco, CA"
  },
  {
    id: "2",
    title: "Brunch & Networking",
    restaurantName: "The Morning Club",
    date: "May 2, 2025",
    time: "10:30 AM",
    price: 30,
    image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGJyZWFrZmFzdHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
    category: "breakfast",
    location: "Seattle, WA"
  },
  {
    id: "3",
    title: "Business Lunch & Learn",
    restaurantName: "Urban Bistro",
    date: "May 5, 2025",
    time: "12:00 PM",
    price: 45,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudCUyMGx1bmNofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60",
    category: "lunch",
    location: "Chicago, IL"
  },
  {
    id: "4",
    title: "Chef's Tasting Menu",
    restaurantName: "Gourmet Heights",
    date: "May 10, 2025",
    time: "6:30 PM",
    price: 95,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGZpbmUlMjBkaW5pbmd8ZW58MHx8MHx8&auto=format&fit=crop&w=800&q=60",
    category: "dinner",
    location: "New York, NY"
  }
];

const FeaturedEvents = () => {
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with a timeout
    const timer = setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

        {loading ? (
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEvents;
