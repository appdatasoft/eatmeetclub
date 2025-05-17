
import { Calendar, Clock, MapPin, Users } from "lucide-react";

interface EventDetailCardProps {
  eventDetails: {
    id: string;
    title: string;
    date: string;
    time: string;
    restaurant?: {
      name: string;
      address: string;
      city: string;
    };
  };
  ticketDetails: {
    quantity: number;
    price: number;
    service_fee: number;
    total_amount: number;
  };
}

const EventDetailCard = ({ eventDetails, ticketDetails }: EventDetailCardProps) => {
  return (
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
        <TicketPriceSummary ticketDetails={ticketDetails} />
      </div>
    </div>
  );
};

const TicketPriceSummary = ({ ticketDetails }: { ticketDetails: EventDetailCardProps["ticketDetails"] }) => {
  return (
    <>
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
    </>
  );
};

export default EventDetailCard;
