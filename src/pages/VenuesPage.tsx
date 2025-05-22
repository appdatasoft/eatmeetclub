
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Restaurant } from "@/components/restaurants/types/restaurant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Utensils as RestaurantIcon, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { fetchWithRetry } from "@/utils/fetchUtils";

const VenuesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      console.log("Fetching restaurants data...");
      
      try {
        // Use the fetchWithRetry utility for safe response handling
        const result = await fetchWithRetry(async () => {
          return await supabase
            .from("restaurants")
            .select("*");
        }, {
          retries: 3,
          baseDelay: 1000
        });
        
        if (result.error) {
          console.error("Error fetching restaurants:", result.error);
          toast({
            title: "Error fetching venues",
            description: result.error.message,
            variant: "destructive",
          });
          throw result.error;
        }
        
        console.log("Restaurants data received:", result.data);
        return result.data as Restaurant[];
      } catch (err: any) {
        console.error("Failed to fetch restaurants:", err);
        toast({
          title: "Error loading venues",
          description: err.message || "An unexpected error occurred",
          variant: "destructive",
        });
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const filteredRestaurants = restaurants?.filter(restaurant => 
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Log to debug
  React.useEffect(() => {
    console.log("VenuesPage rendered");
    console.log("isLoading:", isLoading);
    console.log("restaurants:", restaurants);
    console.log("filteredRestaurants:", filteredRestaurants);
    console.log("error:", error);
  }, [isLoading, restaurants, filteredRestaurants, error]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen py-12 bg-background">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-12 text-center">
            <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-2xl">
              <div className="text-left mb-4 md:mb-0">
                <h1 className="text-4xl font-bold mb-4">Explore Our Venues</h1>
                <p className="text-lg text-gray-600">
                  Discover amazing restaurants and venues for your next dining experience or event
                </p>
              </div>
              {user && (
                <Button 
                  onClick={() => navigate("/dashboard/add-restaurant")} 
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Venue
                </Button>
              )}
            </div>
            
            <div className="w-full max-w-md mt-8">
              <Input
                type="search"
                placeholder="Search venues by name, location, or cuisine..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {error && (
            <div className="text-center py-12">
              <RestaurantIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">Error loading venues</h3>
              <p className="mt-1 text-gray-500">
                {error.message || "An unexpected error occurred. Please try again later."}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                    <div className="mt-4 flex justify-between items-center">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredRestaurants && filteredRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRestaurants.map((restaurant) => (
                    <Card key={restaurant.id} className="overflow-hidden h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">{restaurant.name}</CardTitle>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <RestaurantIcon className="h-4 w-4 mr-1" />
                          {restaurant.cuisine_type}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {restaurant.description || `${restaurant.name} is a venue specializing in ${restaurant.cuisine_type} cuisine.`}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mt-auto">
                          <MapPin className="h-4 w-4 mr-1" />
                          {restaurant.city}, {restaurant.state}
                        </div>
                        <div className="mt-4">
                          <Button asChild variant="outline" className="w-full">
                            <Link to={`/restaurant/${restaurant.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <RestaurantIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No venues found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm ? "Try adjusting your search terms" : "No venues have been added yet"}
                  </p>
                  {user && (
                    <Button 
                      onClick={() => navigate("/dashboard/add-restaurant")}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add a venue
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default VenuesPage;
