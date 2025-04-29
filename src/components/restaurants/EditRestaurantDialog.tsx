
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  cuisine_type: z.string().min(2, "Cuisine type is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipcode: z.string().min(5, "Valid ZIP code is required"),
  phone: z.string().min(10, "Phone number is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  website: string | null;
}

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: restaurant?.name || "",
      cuisine_type: restaurant?.cuisine_type || "",
      address: restaurant?.address || "",
      city: restaurant?.city || "",
      state: restaurant?.state || "",
      zipcode: restaurant?.zipcode || "",
      phone: restaurant?.phone || "",
      website: restaurant?.website || "",
    },
  });

  // Update form values when restaurant changes
  useState(() => {
    if (restaurant) {
      form.reset({
        name: restaurant.name,
        cuisine_type: restaurant.cuisine_type,
        address: restaurant.address,
        city: restaurant.city,
        state: restaurant.state,
        zipcode: restaurant.zipcode || "",
        phone: restaurant.phone,
        website: restaurant.website || "",
      });
    }
  });

  const onSubmit = async (data: FormValues) => {
    if (!restaurant) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({
          name: data.name,
          cuisine_type: data.cuisine_type,
          address: data.address,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          phone: data.phone,
          website: data.website || null,
        })
        .eq("id", restaurant.id);

      if (error) throw error;
      
      toast({
        title: "Restaurant updated",
        description: "Restaurant details have been updated successfully",
      });
      
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error updating restaurant:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update restaurant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Restaurant name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cuisine_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cuisine Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Italian, Thai, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditRestaurantDialog;
