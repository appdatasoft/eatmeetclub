import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { membershipFormSchema, MembershipFormValues } from "@/lib/schemas/membership";
import { createCheckoutSession } from "@/lib/createCheckoutSession";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import MembershipFormFields from "@/components/membership/MembershipFormFields";

const BecomeMember = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (values: MembershipFormValues) => {
    setIsLoading(true);

    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // If not logged in, send magic link
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            shouldCreateUser: true,
            emailRedirectTo: "https://www.eatmeetclub.com/membership-confirmed",
          },
        });

        if (error) throw new Error("Failed to send login email.");
        alert("✅ Check your email for a login link. Then return here to complete your payment.");
        return;
      }

      // Prepare checkout
      const fullName = `${values.firstName} ${values.lastName}`;
      const response = await createCheckoutSession({
        email: values.email,
        name: fullName,
        phone: values.phone,
        address: values.address,
        stripeMode: "test", // change to "live" when ready
      });

      if (response?.url) {
        window.location.href = response.url;
      } else {
        throw new Error(response.error || "Failed to create Stripe checkout session.");
      }

    } catch (err: any) {
      alert(err.message || "An unexpected error occurred.");
      console.error("❌ BecomeMember error:", err);
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
