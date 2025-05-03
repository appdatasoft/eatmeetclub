import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMembershipVerification } from "@/hooks/membership/useMembershipVerification";
import { useCheckoutSession } from "@/hooks/membership/useCheckoutSession";
import useMembershipSubmission from "@/hooks/membership/useMembershipSubmission";
import { membershipFormSchema, MembershipFormValues } from "@/lib/schemas/membership";

const MembershipSteps = () => {
  const { handleMembershipSubmit, isLoading } = useMembershipSubmission();

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      name: localStorage.getItem('signup_name') || "",
      email: localStorage.getItem('signup_email') || "",
      phone: localStorage.getItem('signup_phone') || "",
      address: localStorage.getItem('signup_address') || "",
    },
  });

  const onSubmit = async (values: MembershipFormValues) => {
    await handleMembershipSubmit(values);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <h2 className="text-xl font-bold">Membership Information</h2>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
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
                  <Input type="email" placeholder="you@example.com" {...field} />
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
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="123-456-7890" {...field} />
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
                  <Input placeholder="123 Main St, City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Processing..." : "Complete Payment"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default MembershipSteps;
