
import { z } from "zod";

export const paymentFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
