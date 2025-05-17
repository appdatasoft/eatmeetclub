
import { z } from "zod";

// Base schema with required fields
export const paymentFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Extended schema when all fields are required
export const requiredPaymentFormSchema = paymentFormSchema.extend({
  phone: z.string().min(1, { message: "Phone number is required" }),
  address: z.string().min(1, { message: "Address is required" }),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
