
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RestaurantInfoProps {
  id?: string;
  name: string;
  description?: string;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ id, name, description }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const isValidRestaurant = id && id !== "unknown";
  const restaurantName = name || "Unknown Restaurant";
  const restaurantDescription = description || `${restaurantName} specializes in sustainable, locally-sourced cuisine with a focus on seasonal ingredients.`;
  
  useEffect(() => {
    // Attempt to get a restaurant image if we have a valid restaurant ID
    const fetchRestaurantImage = async () => {
      if (isValidRestaurant) {
        try {
          // You could fetch restaurant image from storage here
          // For now, we'll use a placeholder
          setImageUrl("https://images.unsplash.com/photo-1581954548122-53a79ddb74f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80");
        } catch (error) {
          console.error("Error fetching restaurant image:", error);
        }
      }
    };
    
    fetchRestaurantImage();
  }, [id, isValidRestaurant]);
  
  console.log("RestaurantInfo props:", { id, name, description, isValidRestaurant });
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">About the Restaurant</h2>
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden flex items-center justify-center">
          {isValidRestaurant && imageUrl ? (
            <img 
              src={imageUrl} 
              alt={restaurantName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <Building className="h-6 w-6 text-gray-400" />
          )}
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
        <Link 
          to={`/restaurant/${id}`}
          className="text-primary hover:underline font-medium"
        >
          View Restaurant Profile
        </Link>
      )}
    </div>
  );
};

export default RestaurantInfo;
