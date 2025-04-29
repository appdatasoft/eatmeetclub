
import { z } from "zod";

export const restaurantFormSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  cuisine_type: z.string().min(2, "Cuisine type is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipcode: z.string().min(5, "Valid ZIP code is required"),
  phone: z.string().min(10, "Phone number is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal('')),
});

export type RestaurantFormValues = z.infer<typeof restaurantFormSchema>;
