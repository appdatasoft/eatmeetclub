
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarPlus, Edit, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditRestaurantDialog from '@/components/restaurants/EditRestaurantDialog';
import DeleteRestaurantDialog from '@/components/restaurants/DeleteRestaurantDialog';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  website: string | null;
  zipcode: string;
}

interface RestaurantsListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
  onRestaurantUpdate: () => void;
}

const RestaurantsList = ({ restaurants, isLoading, onRestaurantUpdate }: RestaurantsListProps) => {
  const navigate = useNavigate();
  
  // State for edit/delete restaurant dialogs
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteRestaurant, setDeleteRestaurant] = useState<{id: string, name: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  console.log("Restaurants in RestaurantsList:", restaurants); // Debug log
  
  const handleCreateEvent = (restaurantId: string) => {
    navigate(`/dashboard/create-event?restaurantId=${restaurantId}`);
  };
  
  // Restaurant editing functions
  const openEditDialog = (restaurant: Restaurant) => {
    console.log("Opening edit dialog for:", restaurant);
    setEditRestaurant(restaurant);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (id: string, name: string) => {
    console.log("Opening delete dialog for:", id, name);
    setDeleteRestaurant({ id, name });
    setIsDeleteDialogOpen(true);
  };
  
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.cuisine_type}</TableCell>
                      <TableCell>{restaurant.city}, {restaurant.state}</TableCell>
                      <TableCell>{restaurant.phone}</TableCell>
                      <TableCell className="text-right">
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
                            onClick={() => openEditDialog(restaurant)}
                            title="Edit Restaurant"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(restaurant.id, restaurant.name)}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">You haven't added any restaurants yet.</p>
              <Button onClick={() => navigate('/dashboard/add-restaurant')}>
                Add Your First Restaurant
              </Button>
            </div>
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
