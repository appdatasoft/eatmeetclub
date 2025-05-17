
import React from "react";
import { Link } from "react-router-dom";
import { Building } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface RestaurantInfoProps {
  id?: string;
  name: string;
  description: string;
  logoUrl?: string | null;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ 
  id, 
  name, 
  description,
  logoUrl
}) => {
  const isValidRestaurant = id && id !== "unknown";
  const restaurantName = name || "Unknown Restaurant";
  
  // Use the actual description if available, otherwise provide a fallback
  const restaurantDescription = description || 
    `${restaurantName} specializes in sustainable, locally-sourced cuisine with a focus on seasonal ingredients.`;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">About the Restaurant</h2>
      <div className="flex items-center mb-4">
        <div className="relative">
          <Avatar className="w-12 h-12 mr-4">
            {logoUrl ? (
              <AvatarImage 
                src={logoUrl} 
                alt={restaurantName} 
                className="object-cover"
              />
            ) : (
              <AvatarFallback data-testid="avatar-fallback">
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
