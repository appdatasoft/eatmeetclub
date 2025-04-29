
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteRestaurantDialogProps {
  restaurantId: string;
  restaurantName: string;
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteRestaurantDialog = ({
  restaurantId,
  restaurantName,
  isOpen,
  onClose,
  onDelete,
}: DeleteRestaurantDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", restaurantId);

      if (error) throw error;
      
      toast({
        title: "Restaurant deleted",
        description: "The restaurant has been removed successfully",
      });
      
      onDelete();
      onClose();
    } catch (error: any) {
      console.error("Error deleting restaurant:", error);
      
      // Check if the error is related to foreign key constraints
      if (error.code === '23503') {
        toast({
          title: "Cannot delete restaurant",
          description: "This restaurant has events associated with it. Delete the events first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to delete restaurant",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-[99] bg-black/50" />
      <AlertDialogContent className="fixed z-[100] top-1/2 left-1/2 max-w-md -translate-x-1/2 -translate-y-1/2">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{restaurantName}</strong> and cannot be undone.
            {isLoading && (
              <div className="mt-2 text-orange-600">
                Please wait, deleting restaurant...
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Restaurant"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRestaurantDialog;
