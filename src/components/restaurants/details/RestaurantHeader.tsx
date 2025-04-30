
import React from "react";
import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Restaurant } from "@/components/restaurants/types/restaurant";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
}

const RestaurantHeader: React.FC<RestaurantHeaderProps> = ({ restaurant }) => {
  return (
    <div className="bg-accent py-12">
      <div className="container-custom">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <Link to={`/restaurant/${restaurant.id}`} className="hover:text-primary transition-colors">
            {restaurant.name}
          </Link>
        </h1>
        <p className="text-gray-600 flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {restaurant.city}, {restaurant.state}
        </p>
      </div>
    </div>
  );
};

export default RestaurantHeader;
