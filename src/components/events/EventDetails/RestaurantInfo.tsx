
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RestaurantInfoProps {
  restaurant: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    description?: string;
    logo_url?: string;
  };
  isCurrentUserOwner: boolean;
}

const RestaurantInfo: React.FC<RestaurantInfoProps> = ({ restaurant, isCurrentUserOwner }) => {
  const { user } = useAuth();
  const locationStr = restaurant?.address 
    ? `${restaurant.address}, ${restaurant.city || ''} ${restaurant.state || ''} ${restaurant.zipcode || ''}`
    : 'Location information not available';

  const isKnownRestaurant = restaurant.id !== 'unknown';

  return (
    <div className="restaurant-info bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-16 w-16">
          {restaurant.logo_url ? (
            <AvatarImage src={restaurant.logo_url} alt={restaurant.name} />
          ) : (
            <AvatarFallback data-testid="avatar-fallback" className="text-lg">
              {restaurant.name?.slice(0, 2).toUpperCase() || "R"}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div>
          {isKnownRestaurant ? (
            <Link to={`/restaurant/${restaurant.id}`} className="hover:underline">
              <h3 className="text-xl font-semibold">{restaurant.name || 'Unknown Restaurant'}</h3>
            </Link>
          ) : (
            <h3 className="text-xl font-semibold">{restaurant.name || 'Unknown Restaurant'}</h3>
          )}
        </div>
      </div>
      
      {restaurant?.description && (
        <p className="text-gray-700 mb-4">{restaurant.description}</p>
      )}
      
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex items-start">
          <span className="text-gray-500 w-20">Location:</span>
          <span className="text-gray-800">{locationStr}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {isKnownRestaurant && (
          <Link to={`/restaurant/${restaurant.id}`}>
            <Button variant="outline" size="sm">
              View Restaurant Profile
            </Button>
          </Link>
        )}

        {(isCurrentUserOwner || user) && isKnownRestaurant && (
          <Link to={`/dashboard/restaurant-menu/${restaurant.id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              <span>Manage Menu</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default RestaurantInfo;
