
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useMenuItemsFetcher } from "./restaurant-menu/hooks/useMenuItemsFetcher";
import LoadingSkeleton from "./restaurant-menu/LoadingSkeleton";
import EmptyMenuState from "./restaurant-menu/EmptyMenuState";
import MenuList from "./restaurant-menu/MenuList";
import type { RestaurantMenuProps } from "./restaurant-menu/types";

export const RestaurantMenuPreview: React.FC<RestaurantMenuProps> = ({ restaurantId }) => {
  const { menuItems, isLoading, error } = useMenuItemsFetcher(restaurantId);
  const { toast } = useToast();

  // For debugging - log the restaurantId
  React.useEffect(() => {
    console.log("RestaurantMenuPreview - restaurantId:", restaurantId);
  }, [restaurantId]);

  // Show error toast if there's an error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return (
    <div className="bg-white h-full p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Menu</h2>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : !menuItems || menuItems.length === 0 ? (
        <EmptyMenuState />
      ) : (
        <MenuList menuItems={menuItems} />
      )}
    </div>
  );
};

export default RestaurantMenuPreview;
