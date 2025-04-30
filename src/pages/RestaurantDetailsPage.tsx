
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { Restaurant } from "@/components/restaurants/types/restaurant";
import { useAuth } from "@/hooks/useAuth";
import RestaurantHeader from "@/components/restaurants/details/RestaurantHeader";
import RestaurantAbout from "@/components/restaurants/details/RestaurantAbout";
import RestaurantContact from "@/components/restaurants/details/RestaurantContact";
import RestaurantEvents from "@/components/restaurants/details/RestaurantEvents";
import RestaurantDetailsSkeleton from "@/components/restaurants/details/RestaurantDetailsSkeleton";
import RestaurantErrorState from "@/components/restaurants/details/RestaurantErrorState";

const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
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
    return <RestaurantDetailsSkeleton />;
  }

  if (error || !restaurant) {
    return <RestaurantErrorState />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <RestaurantHeader restaurant={restaurant} />

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <RestaurantAbout restaurant={restaurant} />
              <RestaurantEvents restaurantName={restaurant.name} events={events} />
            </div>

            <div>
              <RestaurantContact restaurant={restaurant} isOwner={isOwner} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetailsPage;
