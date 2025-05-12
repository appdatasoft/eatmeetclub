import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { CheckCircle2, Calendar, MapPin, Clock, Users, Mail } from "lucide-react";

const TicketSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      toast({
        title: "Error",
        description: "No payment information found",
        variant: "destructive",
      });
      navigate("/events");
      return;
    }

    const verifyPayment = async () => {
      try {
        // Get session for the API call
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast({
            title: "Authentication Required",
            description: "Please log in to view ticket details",
            variant: "default",
          });
          navigate("/login");
          return;
        }

        // Verify the payment with Stripe
        const response = await supabase.functions.invoke("verify-ticket-payment", {
          body: { sessionId },
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
          },
        });

        if (response.error) {
          throw new Error(response.error.message || "Failed to verify payment");
        }

        console.log("Verification response:", response.data);

        // Get ticket details from response
        const ticket = response.data.ticket;
        setTicketDetails(ticket);

        // Notify about invoice email
        if (response.data.emailSent) {
          toast({
            title: "Invoice Email Sent",
            description: "Your ticket details have been emailed to you",
          });
        }

        // Get event details
        if (ticket) {
          const { data: eventData, error: eventError } = await supabase
            .from("events")
            .select("*, restaurant:restaurants(*)")
            .eq("id", ticket.event_id)
            .single();

          if (eventError) {
            throw new Error(eventError.message);
          }

          // Format date to be more readable
          const formattedDate = new Date(eventData.date).toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          );

          setEventDetails({
            ...eventData,
            date: formattedDate,
          });
        }

        toast({
          title: "Success!",
          description: "Your tickets have been purchased successfully",
        });
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to verify payment",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    // Get stored ticket details from localStorage
    const storedTicketDetails = localStorage.getItem("ticketDetails");
    if (storedTicketDetails) {
      const parsedDetails = JSON.parse(storedTicketDetails);
      setTicketDetails(parsedDetails);
    }

    verifyPayment();

    // Clear the stored ticket details
    localStorage.removeItem("ticketDetails");
  }, [sessionId, navigate, toast]);

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Thank You For Your Purchase!</h1>
            <p className="text-gray-600 mb-2">
              Your tickets have been purchased successfully.
            </p>
            <p className="text-gray-600 flex items-center justify-center">
              <Mail className="h-4 w-4 mr-1 text-gray-500" />
              An invoice has been sent to your email
            </p>
          </div>

          {isVerifying ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3">Verifying your payment...</span>
            </div>
          ) : (
            <>
              {eventDetails && (
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">{eventDetails.title}</h2>
                    <p className="text-gray-600 mb-4">
                      at {eventDetails.restaurant?.name}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        <span>{eventDetails.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-500 mr-2" />
                        <span>{eventDetails.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                        <span>
                          {eventDetails.restaurant?.address},{" "}
                          {eventDetails.restaurant?.city}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-gray-500 mr-2" />
                        <span>{ticketDetails?.quantity} Tickets</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t px-6 py-4">
                    <div className="flex justify-between mb-2">
                      <span>Tickets ({ticketDetails?.quantity} x ${ticketDetails?.price?.toFixed(2)})</span>
                      <span>${(ticketDetails?.price * ticketDetails?.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>Service Fee</span>
                      <span>${ticketDetails?.service_fee?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold mt-4 pt-2 border-t">
                      <span>Total</span>
                      <span>${ticketDetails?.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  className="bg-primary text-white px-6 py-2 rounded hover:bg-primary/90 transition-colors"
                  onClick={() => navigate(`/event/${eventDetails?.id}`)}
                >
                  View Event
                </button>
                <button
                  className="bg-gray-100 text-gray-800 px-6 py-2 rounded hover:bg-gray-200 transition-colors"
                  onClick={() => navigate("/events")}
                >
                  Browse More Events
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default TicketSuccess;
