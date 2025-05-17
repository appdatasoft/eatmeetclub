
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SupabaseImage from "@/components/common/SupabaseImage";

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  price: number;
  cover_image?: string;
  published: boolean;
}

interface RestaurantEventsProps {
  restaurantName: string;
  events: Event[];
}

const RestaurantEvents: React.FC<RestaurantEventsProps> = ({ restaurantName, events }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Upcoming Events at {restaurantName}</h2>
      
      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden h-full">
              <div className="h-40">
                <SupabaseImage 
                  src={event.cover_image || ''}
                  alt={`${event.title} cover image`}
                  className="h-full w-full object-cover"
                  fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23888'%3ENo Event Image%3C/text%3E%3C/svg%3E"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600">{new Date(event.date).toLocaleDateString()}</span>
                  <span className="text-primary font-medium">${event.price}</span>
                </div>
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-accent rounded-lg">
          <p className="text-gray-600">No upcoming events at this restaurant.</p>
        </div>
      )}
    </div>
  );
};

export default RestaurantEvents;
