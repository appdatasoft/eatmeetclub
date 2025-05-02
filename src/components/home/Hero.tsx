
import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Use a default email that will allow Stripe to work but still be editable
      const defaultEmail = "guest@example.com";
      
      // Store this default for verification later
      localStorage.setItem('signup_email', defaultEmail);
      localStorage.setItem('signup_name', 'Guest User');
      
      // Create a checkout session directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: defaultEmail, // Use default email that will be editable in Stripe checkout
            name: "",  // Leave name empty so user can enter it
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
    <div 
      className="w-full py-12 md:py-24 relative h-[500px]"
      style={{ 
        backgroundImage: `url('/lovable-uploads/37ba24a5-e795-4364-9d0c-e41383e1dc60.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#B5642A" // Fallback color that matches the image
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      <div className="container-custom relative z-10 h-full flex items-center">
        <div className="flex flex-col items-center text-center w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            Link Up Over Food <span className="text-white">&</span> Conversation
          </h1>
          
          <p className="text-white text-xl md:text-2xl mb-8 max-w-2xl">
            Join us for fun social dining where strangers become friends.
          </p>
          
          <Button 
            onClick={handleCheckout}
            size="lg" 
            isLoading={isLoading}
            className="bg-[#FEC6A1] text-[#703E1E] hover:bg-[#FDE1D3] px-10 py-4 text-xl font-bold rounded-full"
          >
            BECOME A MEMBER
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
