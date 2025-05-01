
import { EventDetails } from "../types/eventTypes";

/**
 * Stores ticket purchase details in localStorage for access after payment
 */
export const storeTicketDetails = (
  event: EventDetails,
  ticketCount: number,
  serviceFee: number,
  totalAmount: number
) => {
  // Ensure restaurant data has all required properties
  const restaurantData = event.restaurant || { name: "Unknown Venue" };
  const restaurantAddress = 'address' in restaurantData ? restaurantData.address : '';
  const restaurantCity = 'city' in restaurantData ? restaurantData.city : '';
  
  localStorage.setItem('ticketDetails', JSON.stringify({
    eventId: event.id,
    eventTitle: event.title,
    quantity: ticketCount,
    price: event.price,
    service_fee: serviceFee,
    total_amount: totalAmount,
    restaurant: {
      name: restaurantData.name,
      address: restaurantAddress,
      city: restaurantCity
    },
    date: event.date,
    time: event.time,
    timestamp: Date.now() // Add timestamp for tracking
  }));
};

/**
 * Saves pending purchase information to localStorage when user is not authenticated
 */
export const storePendingPurchase = (eventId: string, ticketCount: number, redirectPath: string) => {
  const pendingPurchase = {
    eventId,
    quantity: ticketCount,
    redirectPath,
    timestamp: Date.now()
  };
  
  localStorage.setItem('pendingTicketPurchase', JSON.stringify(pendingPurchase));
};
