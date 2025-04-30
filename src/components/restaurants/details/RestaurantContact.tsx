
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Restaurant } from "@/components/restaurants/types/restaurant";

interface RestaurantContactProps {
  restaurant: Restaurant;
  isOwner: boolean;
}

const RestaurantContact: React.FC<RestaurantContactProps> = ({ restaurant, isOwner }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default RestaurantContact;
