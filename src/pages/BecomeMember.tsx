import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { membershipFormSchema, MembershipFormValues } from "@/lib/schemas/membership";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import MembershipFormFields from "@/components/membership/MembershipFormFields";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const BecomeMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // If not logged in, redirect to login page
  useEffect(() => {
    if (!user && !isLoading) {
      toast({
        title: "Login Required",
        description: "Please log in or sign up to become a member",
      });
      navigate('/login?redirect=become-member');
    }
  }, [user, navigate, toast, isLoading]);
  
  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipFormSchema),
    defaultValues: {
      name: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: user?.user_metadata?.phone || "",
      address: user?.user_metadata?.address || "",
    },
  });
  
  // Update form values when user data is available
  useEffect(() => {
    if (user) {
      form.setValue("name", user.user_metadata?.full_name || "");
      form.setValue("email", user.email || "");
      form.setValue("phone", user.user_metadata?.phone || "");
      form.setValue("address", user.user_metadata?.address || "");
    }
  }, [user, form]);

  const onSubmit = async (values: MembershipFormValues) => {
    setIsLoading(true);

    try {
      const res = await fetch(
        "https://wocfwpedauuhlrfugxuu.supabase.co/functions/v1/create-membership-checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            email: values.email,
            name: values.name,
            phone: values.phone,
            address: values.address
          }),
        }
      );

      const raw = await res.text();
      console.log("Raw response:", raw);

      let data;
      try {
        data = JSON.parse(raw);
      } catch (err) {
        console.error("Failed to parse response:", raw);
        throw new Error("Invalid response from server");
      }

      if (data?.success && data?.url) {
        window.location.href = data.url;
      } else if (data?.redirect) {
        window.location.href = data.redirect;
      } else {
        throw new Error(data?.error || "Unexpected error. Try again.");
      }
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message || "Failed to start checkout.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading or redirect if not logged in
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-bold mb-6">Become a Member</h2>
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            Complete your membership information to continue to payment.
          </AlertDescription>
        </Alert>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <MembershipFormFields form={form} disabled={isLoading} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Complete Payment"}
            </Button>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
};

export default BecomeMember;
