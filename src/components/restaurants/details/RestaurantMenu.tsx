
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import RestaurantMenuPreview from "@/components/events/RestaurantMenuPreview";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface RestaurantMenuProps {
  restaurantId: string;
  restaurantName: string;
  isOwner: boolean;
}

const RestaurantMenu: React.FC<RestaurantMenuProps> = ({
  restaurantId,
  restaurantName,
  isOwner
}) => {
  const { user } = useAuth();

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-xl font-semibold">Restaurant Menu</h2>
        {isOwner && (
          <Link to={`/dashboard/restaurant-menu/${restaurantId}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span>Manage Menu</span>
            </Button>
          </Link>
        )}
      </div>
      
      <div className="p-6">
        <RestaurantMenuPreview restaurantId={restaurantId} />
      </div>
    </div>
  );
};

export default RestaurantMenu;
