
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MembershipBenefits from "./MembershipBenefits";

export const membershipSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }).optional(),
  address: z.string().min(5, { message: "Please enter your address" }),
  cardNumber: z.string()
    .min(16, { message: "Card number must be at least 16 digits" })
    .refine((val) => /^[\d\s]+$/.test(val), { 
      message: "Card number can only contain digits and spaces" 
    })
    .refine((val) => {
      // Luhn algorithm for card number validation
      const digits = val.replace(/\s/g, '');
      if (!/^\d+$/.test(digits)) return false;
      
      let sum = 0;
      let shouldDouble = false;
      
      // Loop through values starting from the rightmost digit
      for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits.charAt(i));
        
        if (shouldDouble) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        
        sum += digit;
        shouldDouble = !shouldDouble;
      }
      
      return (sum % 10) === 0;
    }, { message: "Please enter a valid card number" }),
  cardExpiry: z.string()
    .min(5, { message: "Please enter a valid expiry date" })
    .refine((val) => /^\d{2}\/\d{2}$/.test(val), { 
      message: "Expiry date must be in MM/YY format" 
    })
    .refine((val) => {
      const [month, year] = val.split('/').map(Number);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      // Check if month is valid (1-12)
      if (month < 1 || month > 12) return false;
      
      // Check if the date is in the future
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
      }
      
      return true;
    }, { message: "Card has expired" }),
  cardCvc: z.string()
    .min(3, { message: "CVC must be 3-4 digits" })
    .max(4, { message: "CVC must be 3-4 digits" })
    .refine((val) => /^\d+$/.test(val), { 
      message: "CVC can only contain digits" 
    }),
});

export type MembershipFormValues = z.infer<typeof membershipSchema>;

interface MembershipPaymentFormProps {
  membershipFee: number;
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

const MembershipPaymentForm = ({ 
  membershipFee, 
  onSubmit, 
  onCancel, 
  isProcessing 
}: MembershipPaymentFormProps) => {
  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    return formatted.slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  return (
    <>
      <MembershipBenefits />
      
      <div className="border-t border-gray-200 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Enter your phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium mb-4">Payment Details</h3>
              
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234 5678 9012 3456" 
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                        maxLength={19}
                        className={form.formState.errors.cardNumber ? "border-red-500" : ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="cardExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="MM/YY" 
                          {...field}
                          onChange={(e) => {
                            const formatted = formatExpiryDate(e.target.value);
                            field.onChange(formatted);
                          }}
                          maxLength={5}
                          className={form.formState.errors.cardExpiry ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cardCvc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123" 
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            field.onChange(value);
                          }}
                          maxLength={4}
                          className={form.formState.errors.cardCvc ? "border-red-500" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Processing..." : `Subscribe Now - $${membershipFee.toFixed(2)}/month`}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default MembershipPaymentForm;
