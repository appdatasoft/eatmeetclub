
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { membershipFormSchema, MembershipFormValues } from "@/lib/schemas/membership";
import { createCheckoutSession } from "@/lib/createCheckoutSession";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import MembershipFormFields from "@/components/membership/MembershipFormFields";
import { useStripeMode } from "@/hooks/membership/useStripeMode";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BecomeMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isStripeTestMode } = useStripeMode();

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (values: MembershipFormValues) => {
    setIsLoading(true);

    try {
      const response = await createCheckoutSession({
        email: values.email,
        name: values.name,
        phone: values.phone,
        address: values.address,
        stripeMode: isStripeTestMode ? "test" : "live",
      });

      if (response?.url) {
        window.location.href = response.url; // ✅ redirect to Stripe
      } else {
        throw new Error(response?.error || "Failed to create Stripe checkout session.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
      console.error("BecomeMember error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Become a Member</h2>
      
      {isStripeTestMode && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-700">
            Payment system is in test mode. No real charges will be applied.
          </AlertDescription>
        </Alert>
      )}
      
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
