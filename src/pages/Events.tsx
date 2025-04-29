
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventFilters from "@/components/events/EventFilters";
import EventCard, { EventCardProps } from "@/components/events/EventCard";

// Sample event data
const sampleEvents: EventCardProps[] = [
  {
    id: "1",
    title: "Breakfast Networking at The Morning Roost",
    restaurantName: "The Morning Roost",
    date: "May 3, 2025",
    time: "8:00 AM",
    price: 25,
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    category: "breakfast",
    location: "San Francisco, CA"
  },
  {
    id: "2",
    title: "Business Lunch at Urban Kitchen",
    restaurantName: "Urban Kitchen",
    date: "May 5, 2025",
    time: "12:30 PM",
    price: 35,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    category: "lunch",
    location: "New York, NY"
  },
  {
    id: "3",
    title: "Wine & Dine Networking Evening",
    restaurantName: "La Bella Trattoria",
    date: "May 8, 2025",
    time: "7:00 PM",
    price: 60,
    image: "https://images.unsplash.com/photo-1587574293340-e0011c4e8ecf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    category: "dinner",
    location: "Boston, MA"
  },
  {
    id: "4",
    title: "Sunrise Networking Breakfast",
    restaurantName: "Sunrise Cafe",
    date: "May 10, 2025",
    time: "7:30 AM",
    price: 22,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    category: "breakfast",
    location: "Seattle, WA"
  },
  {
    id: "5",
    title: "Tech Meetup & Lunch",
    restaurantName: "Digital Bistro",
    date: "May 12, 2025",
    time: "1:00 PM",
    price: 40,
    image: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    category: "lunch",
    location: "Austin, TX"
  },
  {
    id: "6",
    title: "Gourmet Networking Dinner",
    restaurantName: "Gourmet Heights",
    date: "May 15, 2025",
    time: "7:30 PM",
    price: 75,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    category: "dinner",
    location: "Chicago, IL"
  }
];

interface FilterState {
  category: string;
  date: string;
  price: string;
  location: string;
}

const Events = () => {
  const [filteredEvents, setFilteredEvents] = useState<EventCardProps[]>(sampleEvents);

  const handleFilterChange = (filters: FilterState) => {
    let results = [...sampleEvents];

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
        event.date.includes(filters.date)
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

          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-gray-500">
                Try adjusting your filters to find more events.
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
