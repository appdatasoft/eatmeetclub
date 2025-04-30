
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { Restaurant } from "@/components/restaurants/types/restaurant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, ChefHat, Utensils } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch restaurant details
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", id)
          .single();

        if (restaurantError) {
          throw restaurantError;
        }

        setRestaurant(restaurantData);
        setIsOwner(user && restaurantData.user_id === user.id);
        
        // Fetch related events for this restaurant
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(`
            id, 
            title, 
            date, 
            time, 
            price,
            cover_image,
            published
          `)
          .eq("restaurant_id", id)
          .eq("published", true)
          .order("date", { ascending: true });

        if (eventsError) throw eventsError;

        setEvents(eventsData || []);
      } catch (err: any) {
        console.error("Error fetching restaurant details:", err);
        setError(err.message);
        toast({
          title: "Error loading restaurant",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRestaurantDetails();
    }
  }, [id, toast, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <div className="container-custom py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Restaurant Not Found</h1>
            <p className="text-gray-600 mb-6">The restaurant you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate("/events")}>Browse Events</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="bg-accent py-12">
          <div className="container-custom">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{restaurant.name}</h1>
            <p className="text-gray-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {restaurant.city}, {restaurant.state}
            </p>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About {restaurant.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-4">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {restaurant.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{restaurant.cuisine_type} Cuisine</p>
                      <p className="text-sm text-gray-500">
                        {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zipcode}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <ChefHat className="w-5 h-5 mr-2 text-primary" />
                      <p>Cuisine: {restaurant.cuisine_type}</p>
                    </div>

                    {restaurant.website && (
                      <div>
                        <a 
                          href={restaurant.website} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <Utensils className="w-5 h-5 mr-2" />
                          Visit Website
                        </a>
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium mt-4 mb-2">Restaurant Description</p>
                      <p className="text-gray-700">
                        {restaurant.description || 
                          `${restaurant.name} is a ${restaurant.cuisine_type.toLowerCase()} restaurant located in ${restaurant.city}, ${restaurant.state}. 
                          Come enjoy our delicious food and excellent service!`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Restaurant Events Section */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">Upcoming Events at {restaurant.name}</h2>
                {events.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {events.map((event) => (
                      <Card key={event.id} className="overflow-hidden h-full">
                        <div 
                          className="h-40 bg-cover bg-center" 
                          style={{ 
                            backgroundImage: `url(${event.cover_image || 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60'})` 
                          }}
                        />
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
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{restaurant.phone}</p>
                    </div>
                    {restaurant.website && (
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a 
                          href={restaurant.website} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {restaurant.website.replace(/(^\w+:|^)\/\//, '')}
                        </a>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p>{restaurant.address}</p>
                      <p>{restaurant.city}, {restaurant.state} {restaurant.zipcode}</p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="mt-6">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate("/dashboard")}
                      >
                        Manage Restaurant
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetailsPage;
