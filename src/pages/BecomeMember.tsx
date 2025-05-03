
// src/pages/become-member.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipFormSchema, MembershipFormValues } from "@/lib/schemas/membership";
import { useCheckoutSession } from "@/hooks/membership/useCheckoutSession";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import MembershipFormFields from "@/components/membership/MembershipFormFields";

const BecomeMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { createCheckoutSession } = useCheckoutSession();

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: ""
    }
  });

  const onSubmit = async (values: MembershipFormValues) => {
    setIsLoading(true);
    try {
      // Combine first and last name for the API call
      const fullName = `${values.firstName} ${values.lastName}`;
      
      await createCheckoutSession(
        values.email,
        fullName,
        values.phone,
        values.address,
        {
          createUser: true,
          sendPasswordEmail: true,
          sendInvoiceEmail: true,
          checkExisting: true
        }
      );
    } catch (error) {
      console.error("Membership submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Become a Member</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <MembershipFormFields form={form} disabled={isLoading} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Complete Payment"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default BecomeMember;
