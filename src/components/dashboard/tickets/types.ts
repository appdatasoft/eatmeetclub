
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
