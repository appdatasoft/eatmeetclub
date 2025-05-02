
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
      // Store minimal user details in localStorage for later use in verification
      localStorage.setItem('signup_email', 'guest@example.com');
      localStorage.setItem('signup_name', 'Guest User');
      
      // Create a payment intent directly
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || "https://wocfwpedauuhlrfugxuu.supabase.co"}/functions/v1/create-membership-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: 'guest@example.com',
            name: 'Guest User',
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create payment intent");
      }
      
      const data = await response.json();
      console.log("Payment intent created:", data);
      
      if (data.clientSecret) {
        // Redirect to the payment page with the client secret
        navigate(`/membership-payment?intent=${data.paymentIntentId}`);
      } else {
        throw new Error("No client secret returned");
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
