
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

export interface UserTicketsProps {
  userId: string;
}
