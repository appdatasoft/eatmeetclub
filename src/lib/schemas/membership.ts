
// src/lib/schemas/membership.ts
import * as z from "zod";

export const membershipFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Phone number is required"),
  address: z.string().min(1, "Address is required")
});

export type MembershipFormValues = z.infer<typeof membershipFormSchema>;
