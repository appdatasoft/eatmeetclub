import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface RestaurantInfoProps {
  restaurant: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    description?: string;
  };
  isCurrentUserOwner: boolean;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant, isCurrentUserOwner }) => {
  const { user } = useAuth();
  const locationStr = restaurant?.address 
    ? `${restaurant.address}, ${restaurant.city || ''} ${restaurant.state || ''} ${restaurant.zipcode || ''}`
    : 'Location information not available';

  return (
    <div className="restaurant-info bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-xl font-semibold mb-2">{restaurant?.name || 'Unknown Restaurant'}</h3>
      
      {restaurant?.description && (
        <p className="text-gray-700 mb-4">{restaurant.description}</p>
      )}
      
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex items-start">
          <span className="text-gray-500 w-20">Location:</span>
          <span className="text-gray-800">{locationStr}</span>
        </div>
      </div>

      {(isCurrentUserOwner || user) && (
        <div className="mt-4 flex">
          <Link to={`/dashboard/restaurant-menu/${restaurant.id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <span>Manage Menu</span>
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default RestaurantInfo;
