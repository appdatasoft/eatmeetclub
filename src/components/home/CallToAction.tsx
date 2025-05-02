
import { Button } from "@/components/common/Button";
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const CallToAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      // If user is logged in, use their email, otherwise use a default
      const email = user?.email || "guest@example.com";
      const name = user?.user_metadata?.name || "";
      
      // Store for verification later
      localStorage.setItem('signup_email', email);
      if (name) {
        localStorage.setItem('signup_name', name);
      }
      
      // Create a checkout session directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user?.id ? { Authorization: `Bearer ${localStorage.getItem('supabase.auth.token')}` } : {})
          },
          body: JSON.stringify({
            email, // Use user email or default
            name,  // Can be empty to let user enter it
            redirectToCheckout: true, // New flag to request Stripe checkout URL
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
      } else if (data.clientSecret) {
        // Fallback to our payment page if only client secret is provided
        navigate(`/membership-payment?intent=${data.paymentIntentId}`);
      } else {
        throw new Error("No checkout URL or client secret returned");
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
    <section className="py-16 bg-gradient-to-r from-brand-500 to-brand-600 text-white">
      <div className="container-custom text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to join our food adventure?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Become a member today and start connecting with fellow food enthusiasts
          at unique dining experiences.
        </p>
        <Button 
          onClick={handleCheckout} 
          size="lg" 
          variant="secondary"
          isLoading={isLoading}
          className="font-semibold"
        >
          Join Membership Now
        </Button>
      </div>
    </section>
  );
};

export default CallToAction;
