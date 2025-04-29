
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import EditRestaurantDialog from '@/components/restaurants/EditRestaurantDialog';
import DeleteRestaurantDialog from '@/components/restaurants/DeleteRestaurantDialog';
import { Restaurant } from "@/components/restaurants/types/restaurant";
import RestaurantTable from "./restaurants/RestaurantTable";
import EmptyRestaurants from "./restaurants/EmptyRestaurants";
import { useRestaurantDialogs } from "./restaurants/useRestaurantDialogs";

interface RestaurantsListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  onRestaurantUpdate: () => void;
}

const RestaurantsList = ({ restaurants, isLoading, onRestaurantUpdate }: RestaurantsListProps) => {
  const navigate = useNavigate();
  const { 
    editRestaurant, 
    isEditDialogOpen, 
    setIsEditDialogOpen, 
    deleteRestaurant, 
    isDeleteDialogOpen, 
    setIsDeleteDialogOpen,
    openEditDialog,
    openDeleteDialog
  } = useRestaurantDialogs();
  
  console.log("Restaurants in RestaurantsList:", restaurants?.length, restaurants);
  
  return (
    <>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Your Restaurants</CardTitle>
          <CardDescription>Restaurants you've added to the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : restaurants && restaurants.length > 0 ? (
            <RestaurantTable 
              restaurants={restaurants} 
              onEdit={openEditDialog} 
              onDelete={openDeleteDialog} 
            />
          ) : (
            <EmptyRestaurants />
          )}
        </CardContent>
        {restaurants && restaurants.length > 0 && (
          <CardFooter>
            <Button onClick={() => navigate('/dashboard/add-restaurant')}>
              Add Another Restaurant
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Edit Restaurant Dialog */}
      {editRestaurant && (
        <EditRestaurantDialog
          restaurant={editRestaurant}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={onRestaurantUpdate}
        />
      )}

      {/* Delete Restaurant Dialog */}
      {deleteRestaurant && (
        <DeleteRestaurantDialog
          restaurantId={deleteRestaurant.id}
          restaurantName={deleteRestaurant.name}
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onDelete={onRestaurantUpdate}
        />
      )}
    </>
  );
};

export default RestaurantsList;
