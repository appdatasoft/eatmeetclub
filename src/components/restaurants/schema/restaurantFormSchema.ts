
import * as z from "zod";

export const restaurantFormSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  cuisine_type: z.string().min(1, "Cuisine type is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipcode: z.string().min(1, "ZIP code is required"),
  phone: z.string().min(1, "Phone number is required"),
  website: z.string().optional(),
  description: z.string().optional(),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;
