
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Restaurant } from "@/components/restaurants/types/restaurant";
import RestaurantActions from "./RestaurantActions";

interface RestaurantTableProps {
  restaurants: Restaurant[];
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string, name: string) => void;
}

const RestaurantTable = ({ restaurants, onEdit, onDelete }: RestaurantTableProps) => {
  return (
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
                <RestaurantActions 
                  restaurant={restaurant} 
                  onEdit={onEdit} 
                  onDelete={onDelete} 
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RestaurantTable;
