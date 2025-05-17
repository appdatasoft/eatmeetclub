
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
import RestaurantMenu from "@/components/restaurants/details/RestaurantMenu";
import RestaurantDetailsSkeleton from "@/components/restaurants/details/RestaurantDetailsSkeleton";
import RestaurantErrorState from "@/components/restaurants/details/RestaurantErrorState";
import RestaurantLogoUploader from "@/components/restaurants/details/RestaurantLogoUploader";
import EditableField from "@/components/restaurants/details/EditableField";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Image } from "lucide-react";

const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Fetch restaurant data and events
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
        
        // Fetch restaurant logo
        const { data: logoData, error: logoError } = await supabase
          .from("restaurant_menu_media")
          .select("url")
          .eq("restaurant_id", id)
          .eq("media_type", "image")
          .order("created_at", { ascending: false })
          .limit(1);
          
        if (!logoError && logoData && logoData.length > 0) {
          setLogoUrl(logoData[0].url);
        }
        
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

  // Handle field updates
  const handleUpdateField = async (field: string, value: string) => {
    if (!id || !restaurant) return;
    
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ [field]: value })
        .eq("id", id);
        
      if (error) throw error;
      
      // Update the local restaurant object
      setRestaurant({
        ...restaurant,
        [field]: value
      });
      
      toast({
        title: "Updated successfully",
        description: `Restaurant ${field} has been updated.`,
      });
    } catch (error: any) {
      console.error(`Error updating ${field}:`, error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  // Handle logo upload completion
  const handleLogoUploadComplete = (url: string) => {
    setLogoUrl(url);
  };

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
        <div className="bg-primary/10 py-12">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {isOwner ? (
                <RestaurantLogoUploader 
                  restaurantId={restaurant.id} 
                  currentLogoUrl={logoUrl} 
                  onUploadComplete={handleLogoUploadComplete} 
                />
              ) : (
                <Avatar className="w-24 h-24">
                  {logoUrl ? (
                    <AvatarImage src={logoUrl} alt={restaurant.name} className="object-cover" />
                  ) : (
                    <AvatarFallback>
                      <Image className="h-10 w-10 text-gray-400" />
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
              
              <div className="flex-1">
                {isOwner ? (
                  <EditableField
                    value={restaurant.name}
                    fieldName="name"
                    label="Restaurant Name"
                    onSave={(value) => handleUpdateField("name", value)}
                  />
                ) : (
                  <h1 className="text-3xl font-bold">{restaurant.name}</h1>
                )}
                
                {isOwner ? (
                  <EditableField
                    value={restaurant.cuisine_type}
                    fieldName="cuisine_type"
                    label="Cuisine Type"
                    onSave={(value) => handleUpdateField("cuisine_type", value)}
                  />
                ) : (
                  <p className="text-lg">{restaurant.cuisine_type}</p>
                )}
                
                {isOwner ? (
                  <EditableField
                    value={restaurant.address}
                    fieldName="address"
                    label="Address"
                    onSave={(value) => handleUpdateField("address", value)}
                  />
                ) : (
                  <p className="text-gray-600">{restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zipcode}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                {isOwner ? (
                  <EditableField
                    value={restaurant.description || ""}
                    fieldName="description"
                    isMultiline={true}
                    onSave={(value) => handleUpdateField("description", value)}
                  />
                ) : (
                  <p>{restaurant.description || "No description available."}</p>
                )}
              </div>
              
              <RestaurantMenu 
                restaurantId={restaurant.id} 
                restaurantName={restaurant.name} 
                isOwner={isOwner} 
              />
              
              <RestaurantEvents restaurantName={restaurant.name} events={events} />
            </div>

            <div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                
                {isOwner ? (
                  <>
                    <EditableField
                      value={restaurant.phone}
                      fieldName="phone"
                      label="Phone"
                      onSave={(value) => handleUpdateField("phone", value)}
                    />
                    
                    <div className="mt-4">
                      <EditableField
                        value={restaurant.city}
                        fieldName="city"
                        label="City"
                        onSave={(value) => handleUpdateField("city", value)}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <EditableField
                        value={restaurant.state}
                        fieldName="state"
                        label="State"
                        onSave={(value) => handleUpdateField("state", value)}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <EditableField
                        value={restaurant.zipcode}
                        fieldName="zipcode"
                        label="Zipcode"
                        onSave={(value) => handleUpdateField("zipcode", value)}
                      />
                    </div>
                    
                    <div className="mt-4">
                      <EditableField
                        value={restaurant.website || ""}
                        fieldName="website"
                        label="Website"
                        onSave={(value) => handleUpdateField("website", value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Phone</h3>
                      <p>{restaurant.phone}</p>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Address</h3>
                      <p>{restaurant.address}</p>
                      <p>{restaurant.city}, {restaurant.state} {restaurant.zipcode}</p>
                    </div>
                    
                    {restaurant.website && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Website</h3>
                        <a 
                          href={restaurant.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {restaurant.website}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetailsPage;
