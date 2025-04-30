
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Utensils } from "lucide-react";
import { Restaurant } from "@/components/restaurants/types/restaurant";

interface RestaurantAboutProps {
  restaurant: Restaurant;
}

const RestaurantAbout: React.FC<RestaurantAboutProps> = ({ restaurant }) => {
  return (
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
  );
};

export default RestaurantAbout;
