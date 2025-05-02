
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MembershipBenefits from "./MembershipBenefits";
import StripePaymentElement from "./StripePaymentElement";

export const membershipSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }).optional(),
  address: z.string().min(5, { message: "Please enter your address" }),
});

export type MembershipFormValues = z.infer<typeof membershipSchema>;

interface MembershipPaymentFormProps {
  membershipFee: number;
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
  clientSecret: string | null;
  onPaymentSuccess: () => void;
}

const MembershipPaymentForm = ({ 
  membershipFee, 
  onSubmit, 
  onCancel, 
  isProcessing,
  clientSecret,
  onPaymentSuccess
}: MembershipPaymentFormProps) => {
  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const handleFormSubmit = async (values: MembershipFormValues) => {
    await onSubmit(values);
  };

  const email = form.watch("email");
  const formSubmitted = clientSecret !== null;

  return (
    <>
      <MembershipBenefits />
      
      <div className="border-t border-gray-200 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} disabled={formSubmitted} />
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
                    <Input type="email" placeholder="Enter your email" {...field} disabled={formSubmitted} />
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
                    <Input type="tel" placeholder="Enter your phone number" {...field} disabled={formSubmitted} />
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
                    <Input placeholder="Enter your address" {...field} disabled={formSubmitted} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {!formSubmitted ? (
              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? "Processing..." : "Continue"}
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-4">Payment Details</h3>
                <StripePaymentElement
                  clientSecret={clientSecret}
                  email={email}
                  isProcessing={isProcessing}
                  onPaymentSuccess={onPaymentSuccess}
                />
              </div>
            )}
          </form>
        </Form>
      </div>
    </>
  );
};

export default MembershipPaymentForm;
