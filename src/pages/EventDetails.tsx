
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/common/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { EventCardProps } from "@/components/events/EventCard";

// Mock data for a single event
const mockEvent: EventCardProps & { description: string; tickets: number; maxTickets: number } = {
  id: "1",
  title: "Farm-to-Table Dinner Experience",
  restaurantName: "Harvest Table",
  date: "April 30, 2025",
  time: "7:00 PM",
  price: 65,
  image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzdGF1cmFudHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
  category: "dinner",
  location: "123 Market St, San Francisco, CA",
  description: "Join us for a unique farm-to-table dining experience featuring locally sourced ingredients and wines. Our executive chef will prepare a special 5-course menu highlighting seasonal produce from local farms. Throughout the evening, you'll have the opportunity to meet fellow food enthusiasts and learn about sustainable food practices. This event is perfect for foodies, sustainability advocates, or anyone looking to enjoy a delicious meal in good company.",
  tickets: 24,
  maxTickets: 40
};

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<typeof mockEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  useEffect(() => {
    // Simulate API call with a timeout
    const timer = setTimeout(() => {
      setEvent(mockEvent);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [id]);

  const handleBuyTickets = () => {
    setIsPaymentProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsPaymentProcessing(false);
      alert(`Payment successful! You've purchased ${ticketCount} ticket(s) to ${event?.title}.`);
    }, 1500);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-12">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="container-custom py-12 text-center">
          <h2 className="text-2xl font-semibold mb-4">Event Not Found</h2>
          <p className="mb-6">Sorry, the event you're looking for doesn't exist or has been removed.</p>
          <Button href="/events">Browse Events</Button>
        </div>
        <Footer />
      </>
    );
  }

  const ticketsRemaining = event.maxTickets - event.tickets;
  const ticketsPercentage = (event.tickets / event.maxTickets) * 100;

  return (
    <>
      <Navbar />
      <div className="bg-white">
        {/* Hero section with image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <div className="mb-2">
              <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize bg-white/20 backdrop-blur-sm`}>
                {event.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{event.title}</h1>
            <p className="text-lg text-white/90">Hosted by {event.restaurantName}</p>
          </div>
        </div>

        {/* Event details */}
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                <p className="text-gray-700 mb-6">{event.description}</p>

                <div className="flex flex-wrap gap-6 mb-6">
                  <div className="flex items-center">
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{event.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Tickets Remaining</h3>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-teal-500 h-2.5 rounded-full" 
                      style={{ width: `${ticketsPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {ticketsRemaining} of {event.maxTickets} tickets remaining
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Important Notes</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>Please arrive 15 minutes before the event starts</li>
                    <li>Dietary restrictions can be accommodated with 48h notice</li>
                    <li>Tickets are non-refundable but can be transferred</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">About the Restaurant</h2>
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1581954548122-53a79ddb74f9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&q=80" 
                      alt={event.restaurantName} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{event.restaurantName}</h3>
                    <p className="text-sm text-gray-500">4.8 ★ (120+ reviews)</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  {event.restaurantName} specializes in sustainable, locally-sourced cuisine with a focus on seasonal ingredients. 
                  Our restaurant has been serving the community for over 10 years with a commitment to quality and hospitality.
                </p>
                <Button href="#" variant="ghost" size="sm">
                  View Restaurant Profile
                </Button>
              </div>
            </div>

            {/* Ticket purchase sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Purchase Tickets</h3>
                <div className="border-b pb-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Ticket Price</span>
                    <span className="font-medium">${event.price.toFixed(2)}/person</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="ticket-count" className="block text-sm font-medium mb-2">
                    Number of Tickets
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      className="bg-gray-100 p-2 rounded-l-md border border-gray-300"
                      disabled={ticketCount <= 1}
                    >
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="ticket-count"
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Math.max(1, Math.min(ticketsRemaining, parseInt(e.target.value) || 1)))}
                      min="1"
                      max={ticketsRemaining}
                      className="p-2 w-12 text-center border-y border-gray-300"
                    />
                    <button
                      onClick={() => setTicketCount(Math.min(ticketsRemaining, ticketCount + 1))}
                      className="bg-gray-100 p-2 rounded-r-md border border-gray-300"
                      disabled={ticketCount >= ticketsRemaining}
                    >
                      <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${(event.price * ticketCount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Service Fee</span>
                    <span>${(event.price * ticketCount * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center font-medium text-lg mt-4">
                    <span>Total</span>
                    <span>${(event.price * ticketCount * 1.05).toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleBuyTickets} 
                  className="w-full" 
                  size="lg"
                  isLoading={isPaymentProcessing}
                >
                  {isPaymentProcessing ? "Processing..." : `Buy Ticket${ticketCount > 1 ? 's' : ''}`}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-4">
                  By purchasing tickets, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventDetails;
