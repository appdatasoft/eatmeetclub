
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MembershipSteps from "@/components/membership/MembershipSteps";
import { useNavigate } from "react-router-dom";

const BecomeMember = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Effect to prevent repeat submissions or navigation back to this page after checkout initiated
  useEffect(() => {
    const checkoutInitiated = sessionStorage.getItem('checkout_initiated');
    
    if (checkoutInitiated === 'true') {
      // Check if we have email stored before redirecting
      const storedEmail = localStorage.getItem('signup_email');
      if (!storedEmail) {
        console.log("Checkout was initiated but no email found, resetting checkout flag");
        sessionStorage.removeItem('checkout_initiated');
        toast({
          title: "Missing information",
          description: "Your signup information is incomplete. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Redirect to membership payment page to handle post-payment flow
      navigate('/membership-payment');
    }
    
    return () => {
      // Clean up localStorage data when component unmounts if not submitted
      if (!isSubmitted) {
        localStorage.removeItem('signup_email');
        localStorage.removeItem('signup_name');
        localStorage.removeItem('signup_phone');
        localStorage.removeItem('signup_address');
      }
    };
  }, [navigate, isSubmitted, toast]);

  const handleMembershipSubmit = async (values: any) => {
    // Prevent multiple submissions
    if (isLoading || isSubmitted) {
      toast({
        title: "Processing",
        description: "Your membership request is already being processed",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { name, email, phone, address } = values;
      
      // Validate required fields
      if (!email) {
        throw new Error("Email is required");
      }
      
      if (!name) {
        throw new Error("Name is required");
      }
      
      console.log("Storing user details in localStorage:", { email, name, phone, address });
      
      // Store all details for verification later - do this BEFORE any API calls
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
            // Add metadata to help with user creation and emails
            createUser: true,
            sendPasswordEmail: true,
            sendInvoiceEmail: true,
            // Added force flags to ensure database records are created
            forceCreateUser: true,
            createMembershipRecord: true
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
        // Mark checkout as initiated to prevent duplicate submissions
        sessionStorage.setItem('checkout_initiated', 'true');
        setIsSubmitted(true);
        
        // Double check that email is stored
        const checkEmail = localStorage.getItem('signup_email');
        if (!checkEmail) {
          console.error("Email not found in localStorage after setting");
          localStorage.setItem('signup_email', email);
        }
        
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
      
      // Clear localStorage on error to prevent issues in future attempts
      localStorage.removeItem('signup_email');
      localStorage.removeItem('signup_name');
      localStorage.removeItem('signup_phone');
      localStorage.removeItem('signup_address');
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
