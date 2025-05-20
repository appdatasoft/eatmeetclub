
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TicketSuccessHeader from "@/components/tickets/TicketSuccessHeader";
import TicketLoader from "@/components/tickets/TicketLoader";
import EventDetailCard from "@/components/tickets/EventDetailCard";
import ActionButtons from "@/components/tickets/ActionButtons";
import { useTicketVerification } from "@/hooks/useTicketVerification";

// Define interfaces to match the expected types in EventDetailCard
interface FormattedEventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  restaurant?: {
    name: string;
    address: string;
    city: string;
  };
}

interface FormattedTicketDetails {
  quantity: number;
  price: number;
  service_fee: number;
  total_amount: number;
}

const TicketSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const {
    isVerifying,
    ticketDetails,
    eventDetails,
    emailSent
  } = useTicketVerification(sessionId);

  // Format event details to match the expected type
  const formattedEventDetails: FormattedEventDetails | null = eventDetails ? {
    id: eventDetails.id,
    title: eventDetails.title,
    date: eventDetails.date,
    time: eventDetails.time,
    restaurant: eventDetails.restaurant ? {
      name: eventDetails.restaurant.name,
      address: '', // Add fallback or fetch this data
      city: ''     // Add fallback or fetch this data
    } : undefined
  } : null;

  // Format ticket details to match the expected type
  const formattedTicketDetails: FormattedTicketDetails | null = ticketDetails ? {
    quantity: ticketDetails.quantity,
    price: ticketDetails.total_amount / ticketDetails.quantity, // Calculate price per ticket
    service_fee: ticketDetails.total_amount * 0.05, // Estimate service fee
    total_amount: ticketDetails.total_amount
  } : null;

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <TicketSuccessHeader emailSent={emailSent} />

          {isVerifying ? (
            <TicketLoader message="Verifying your payment..." />
          ) : (
            <>
              {formattedEventDetails && formattedTicketDetails && (
                <EventDetailCard 
                  eventDetails={formattedEventDetails}
                  ticketDetails={formattedTicketDetails}
                />
              )}

              <ActionButtons eventId={eventDetails?.id} />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default TicketSuccess;
