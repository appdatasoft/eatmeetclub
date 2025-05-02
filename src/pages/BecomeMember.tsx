
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MembershipSteps from "@/components/membership/MembershipSteps";

const BecomeMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMembershipSubmit = async (values: any) => {
    setIsLoading(true);
    
    try {
      const { name, email, phone, address } = values;
      
      // Store all details for verification later
      localStorage.setItem('signup_email', email);
      localStorage.setItem('signup_name', name);
      if (phone) localStorage.setItem('signup_phone', phone);
      if (address) localStorage.setItem('signup_address', address);
      
      // Create a checkout session directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            name,
            phone,
            address,
            redirectToCheckout: true,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }
      
      const data = await response.json();
      console.log("Checkout session created:", data);
      
      if (data.url) {
        // Redirect directly to Stripe checkout URL
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error starting checkout:", error);
      toast({
        title: "Error",
        description: error.message || "There was a problem starting the checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="bg-brand-500 text-white">
                <CardTitle className="text-2xl">Join Our Membership</CardTitle>
                <CardDescription className="text-white/90">
                  Connect with fellow food enthusiasts at unique dining experiences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <MembershipSteps 
                  onSubmit={handleMembershipSubmit}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BecomeMember;
