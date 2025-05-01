
export interface Ticket {
  id: string;
  user_id: string;
  quantity: number;
  purchase_date: string;
  payment_status: string;
  total_amount: number;
  user_email?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  restaurant_id?: string;
  capacity: number;
  price: number;
  payment_status: string;
  published: boolean;
  tickets_sold?: number;
  restaurant: {
    name: string;
  };
}

export interface EventsListProps {
  events: Event[];
  isLoading: boolean;
  error?: string | null;
  onPublishEvent?: (eventId: string, paymentStatus: string) => void;
  onRefresh?: () => void;
  isAdmin?: boolean;
}
