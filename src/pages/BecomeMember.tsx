import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipFormSchema, MembershipFormValues } from "@/lib/schemas/membership";
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
    },
  });

  const onSubmit = async (values: MembershipFormValues) => {
    setIsLoading(true);

    try {
      const fullName = `${values.firstName} ${values.lastName}`;

      const res = await fetch("/functions/create-membership-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          name: fullName,
          phone: values.phone,
        }),
      });

      const raw = await res.text();
      console.log("🚨 Raw response:", raw);

      const data = JSON.parse(raw);

      if (data?.success && data?.url) {
        window.location.href = data.url;
      } else if (data?.redirect) {
        window.location.href = data.redirect;
      } else {
        throw new Error(data?.error || "Unexpected error");
      }
    } catch (err: any) {
      alert(err.message || "Failed to start checkout.");
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
