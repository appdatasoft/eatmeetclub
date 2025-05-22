
export interface Ticket {
  id: string;
  event_id: string;
  event: {
    title: string;
    date: string;
    time?: string;
  };
  quantity: number;
  total_amount: number;
  purchase_date: string;
  payment_status: string;
}

export interface UserTicketsProps {
  userId?: string;
}

export interface UserTicket {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  restaurant_name: string;
  quantity: number;
  price: number;
  purchase_date: string;
}
