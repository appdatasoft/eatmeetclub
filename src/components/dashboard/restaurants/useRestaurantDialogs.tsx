
import { useState } from 'react';
import { Restaurant } from '@/components/restaurants/types/restaurant';

export const useRestaurantDialogs = () => {
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteRestaurant, setDeleteRestaurant] = useState<{id: string, name: string} | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
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
  
  return {
    editRestaurant,
    isEditDialogOpen,
    setIsEditDialogOpen,
    deleteRestaurant,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    openEditDialog,
    openDeleteDialog
  };
};
