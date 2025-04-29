
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Restaurant } from "./types/restaurant";
import { RestaurantFormValues } from "./schema/restaurantFormSchema";
import RestaurantForm from "./RestaurantForm";
import { useRestaurantEdit } from "./hooks/useRestaurantEdit";

interface EditRestaurantDialogProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditRestaurantDialog = ({
  restaurant,
  isOpen,
  onClose,
  onSave,
}: EditRestaurantDialogProps) => {
  const { isLoading, updateRestaurant } = useRestaurantEdit(onSave, onClose);

  const handleSubmit = async (data: RestaurantFormValues) => {
    if (!restaurant) return;
    await updateRestaurant(restaurant.id, data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-background">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
        </DialogHeader>
        
        <RestaurantForm 
          restaurant={restaurant} 
          isOpen={isOpen} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading} form="restaurant-form">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditRestaurantDialog;
