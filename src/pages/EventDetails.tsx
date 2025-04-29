
import { useParams } from "react-router-dom";
import { useEventDetails } from "@/hooks/useEventDetails";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventInfo from "@/components/events/EventDetails/EventInfo";
import RestaurantInfo from "@/components/events/EventDetails/RestaurantInfo";
import TicketPurchase from "@/components/events/EventDetails/TicketPurchase";
import EventSkeleton from "@/components/events/EventDetails/EventSkeleton";
import EventNotFound from "@/components/events/EventDetails/EventNotFound";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { event, loading, isPaymentProcessing, handleBuyTickets } = useEventDetails(id);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-12">
          <EventSkeleton />
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <EventNotFound />
        <Footer />
      </>
    );
  }

  const ticketsRemaining = event.capacity - (event.tickets_sold || 0);
  const ticketsPercentage = ((event.tickets_sold || 0) / event.capacity) * 100;
  const location = `${event.restaurant.address}, ${event.restaurant.city}, ${event.restaurant.state} ${event.restaurant.zipcode}`;

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <EventHeader title={event.title} restaurantName={event.restaurant.name} />

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <EventInfo 
                description={event.description}
                date={event.date}
                time={event.time}
                location={location}
                capacity={event.capacity}
                ticketsRemaining={ticketsRemaining}
                ticketsPercentage={ticketsPercentage}
              />
              <RestaurantInfo 
                name={event.restaurant.name} 
                description={event.restaurant.description}
              />
            </div>

            {/* Ticket purchase sidebar */}
            <div className="lg:col-span-1">
              <TicketPurchase 
                price={event.price}
                ticketsRemaining={ticketsRemaining}
                onBuyTickets={handleBuyTickets}
                isPaymentProcessing={isPaymentProcessing}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventDetails;
