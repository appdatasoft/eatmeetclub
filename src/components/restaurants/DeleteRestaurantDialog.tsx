
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{restaurantName}</strong> and cannot be undone.
            {isLoading && (
              <div className="mt-2 text-orange-600">
                Please wait, deleting restaurant...
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Restaurant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRestaurantDialog;
