
import { z } from "zod";

// Schema definition for membership form validation
export const membershipFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters."
  }),
  email: z.string().email({
    message: "Please enter a valid email address."
  }),
  phone: z.string().min(7, {
    message: "Phone number must be at least 7 digits."
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters."
  }),
  restaurantId: z.string().uuid({
    message: "Please select a restaurant."
  })
});

export type MembershipFormValues = z.infer<typeof membershipFormSchema>;
