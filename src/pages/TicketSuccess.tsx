
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TicketSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  
  useEffect(() => {
    const verifyPurchase = async () => {
      try {
        setIsLoading(true);
        
        // Get stored ticket details from localStorage
        const storedDetails = localStorage.getItem("ticketDetails");
        if (storedDetails) {
          const parsedDetails = JSON.parse(storedDetails);
          setTicketDetails(parsedDetails);
          
          // Clear the stored details since we've retrieved them
          localStorage.removeItem("ticketDetails");
        }
        
        // Show success message
        toast({
          title: "Purchase Successful",
          description: "Your tickets have been purchased successfully!",
        });
        
        // Further verification could be done here with a verify-ticket-payment edge function
        // That would confirm with Stripe that the payment was successful
        
      } catch (error) {
        console.error("Error verifying purchase:", error);
        toast({
          title: "Verification Error",
          description: "There was an issue verifying your purchase. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyPurchase();
  }, [toast]);

  return (
    <>
      <Navbar />
      <div className="container-custom py-12">
        <Card className="max-w-lg mx-auto p-8">
          {isLoading ? (
            <div className="flex flex-col items-center py-8">
              <div className="h-12 w-12 border-4 border-t-transparent border-primary rounded-full animate-spin mb-4"></div>
              <p>Confirming your purchase...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6 w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">Thank You for Your Purchase!</h1>
              <p className="text-gray-600 mb-6">Your tickets have been confirmed.</p>
              
              {ticketDetails && (
                <div className="bg-gray-50 p-4 rounded-md text-left mb-6">
                  <h2 className="font-semibold mb-2">{ticketDetails.eventTitle}</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Quantity:</p>
                      <p>{ticketDetails.quantity} ticket{ticketDetails.quantity > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Paid:</p>
                      <p>${ticketDetails.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-600 mb-6">
                A confirmation email with your tickets has been sent to your registered email address.
              </p>
              
              <div className="flex flex-col space-y-2">
                <Button onClick={() => navigate(`/event/${ticketDetails?.eventId || ''}`)}>
                  Return to Event
                </Button>
                <Button variant="outline" onClick={() => navigate('/events')}>
                  Browse More Events
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      <Footer />
    </>
  );
};

export default TicketSuccess;
