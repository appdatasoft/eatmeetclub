
import { z } from "zod";

export const signupFormSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  phoneNumber: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
});

export type SignupFormValues = z.infer<typeof signupFormSchema>;
