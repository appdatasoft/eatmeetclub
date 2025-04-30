
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarPlus, Edit, Trash2, ExternalLink, Eye } from "lucide-react";
import { Restaurant } from "@/components/restaurants/types/restaurant";

interface RestaurantActionsProps {
  restaurant: Restaurant;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string, name: string) => void;
}

const RestaurantActions = ({ restaurant, onEdit, onDelete }: RestaurantActionsProps) => {
  const navigate = useNavigate();
  
  const handleCreateEvent = (restaurantId: string) => {
    navigate(`/dashboard/create-event?restaurantId=${restaurantId}`);
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleCreateEvent(restaurant.id)}
        title="Add Event"
      >
        <CalendarPlus className="h-4 w-4 text-primary" />
        <span className="sr-only">Add Event</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
        title="View Restaurant"
      >
        <Eye className="h-4 w-4 text-blue-600" />
        <span className="sr-only">View Restaurant</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(restaurant)}
        title="Edit Restaurant"
      >
        <Edit className="h-4 w-4 text-gray-600" />
        <span className="sr-only">Edit</span>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(restaurant.id, restaurant.name)}
        title="Delete Restaurant"
        className="text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Delete</span>
      </Button>
      
      {restaurant.website && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.open(restaurant.website!, '_blank')}
          title="Visit Website"
        >
          <ExternalLink className="h-4 w-4 text-blue-600" />
          <span className="sr-only">Visit Website</span>
        </Button>
      )}
    </div>
  );
};

export default RestaurantActions;
