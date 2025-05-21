
import { Badge } from "@/components/ui/badge";
import { Restaurant } from "@/components/restaurants/types/restaurant";
import { ShieldCheck, ShieldAlert, Clock } from "lucide-react";

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  isOwner?: boolean;
}

const RestaurantHeader = ({ restaurant, isOwner = false }: RestaurantHeaderProps) => {
  const getVerificationBadge = () => {
    if (!isOwner) return null;
    
    switch (restaurant.verification_status) {
      case 'verified':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <ShieldCheck className="h-3 w-3 mr-1" /> Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <ShieldAlert className="h-3 w-3 mr-1" /> Verification Failed
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50">
            <Clock className="h-3 w-3 mr-1" /> Verification Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
            <ShieldAlert className="h-3 w-3 mr-1" /> Verification Required
          </Badge>
        );
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-4 mb-2">
        {restaurant.logo_url && (
          <img 
            src={restaurant.logo_url}
            alt={restaurant.name}
            className="h-20 w-20 object-cover rounded-lg shadow-sm"
          />
        )}
        
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold">{restaurant.name}</h1>
            {getVerificationBadge()}
          </div>
          <p className="text-sm text-gray-500">{restaurant.cuisine_type}</p>
        </div>
      </div>
      
      {restaurant.description && (
        <p className="text-gray-700 mt-3">{restaurant.description}</p>
      )}
    </div>
  );
};

export default RestaurantHeader;
