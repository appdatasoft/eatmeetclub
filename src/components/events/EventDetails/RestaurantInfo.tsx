
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building, Upload, Edit, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildStorageUrl } from "@/utils/supabaseStorage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface RestaurantInfoProps {
  id?: string;
  name: string;
  description?: string;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ id, name, description }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isValidRestaurant = id && id !== "unknown";
  const restaurantName = name || "Unknown Restaurant";
  const restaurantDescription = description || `${restaurantName} specializes in sustainable, locally-sourced cuisine with a focus on seasonal ingredients.`;
  
  useEffect(() => {
    // Fetch restaurant image from the database
    const fetchRestaurantImage = async () => {
      if (isValidRestaurant) {
        setIsLoading(true);
        try {
          // First try to get restaurant image from restaurant_menu_media 
          const { data: mediaData, error: mediaError } = await supabase
            .from("restaurant_menu_media")
            .select("url")
            .eq("restaurant_id", id)
            .eq("media_type", "image")
            .limit(1);

          if (mediaError) {
            console.error("Error fetching restaurant media:", mediaError);
          } else if (mediaData && mediaData.length > 0) {
            setImageUrl(mediaData[0].url);
          } else {
            // If no specific image found, we could add a fallback database query here
            // For now, set to null to use the Building icon
            setImageUrl(null);
          }
        } catch (error) {
          console.error("Error fetching restaurant image:", error);
          setImageUrl(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        setImageUrl(null);
      }
    };
    
    fetchRestaurantImage();
  }, [id, isValidRestaurant]);
  
  console.log("RestaurantInfo props:", { id, name, description, isValidRestaurant, imageUrl });
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">About the Restaurant</h2>
      <div className="flex items-center mb-4">
        <div className="relative">
          <Avatar className="w-12 h-12 mr-4">
            {isLoading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse"></div>
            ) : isValidRestaurant && imageUrl ? (
              <AvatarImage 
                src={imageUrl} 
                alt={restaurantName} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback>
                <Building className="h-6 w-6 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        <div>
          {isValidRestaurant ? (
            <Link to={`/restaurant/${id}`} className="font-medium hover:text-primary hover:underline">
              {restaurantName}
            </Link>
          ) : (
            <h3 className="font-medium">{restaurantName}</h3>
          )}
          <p className="text-sm text-gray-500">Serving delicious meals</p>
        </div>
      </div>
      <p className="text-gray-700 mb-4">{restaurantDescription}</p>
      
      {isValidRestaurant && (
        <div className="flex justify-between items-center">
          <Link 
            to={`/restaurant/${id}`}
            className="text-primary hover:underline font-medium"
          >
            View Restaurant Profile
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantInfo;
