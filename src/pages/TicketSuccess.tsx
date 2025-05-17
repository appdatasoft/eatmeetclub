
import { useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import TicketSuccessHeader from "@/components/tickets/TicketSuccessHeader";
import TicketLoader from "@/components/tickets/TicketLoader";
import EventDetailCard from "@/components/tickets/EventDetailCard";
import ActionButtons from "@/components/tickets/ActionButtons";
import { useTicketVerification } from "@/hooks/useTicketVerification";

const TicketSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const {
    isVerifying,
    ticketDetails,
    eventDetails,
    emailSent
  } = useTicketVerification(sessionId);

  return (
    <MainLayout>
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto">
          <TicketSuccessHeader emailSent={emailSent} />

          {isVerifying ? (
            <TicketLoader message="Verifying your payment..." />
          ) : (
            <>
              {eventDetails && ticketDetails && (
                <EventDetailCard 
                  eventDetails={eventDetails}
                  ticketDetails={ticketDetails}
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
