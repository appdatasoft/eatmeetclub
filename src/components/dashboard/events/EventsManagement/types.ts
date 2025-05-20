
export interface Event {
  id: string;
  title: string;
  date: string;
  restaurant: {
    name: string;
  };
  price: number;
  capacity: number;
  tickets_sold: number;
  published: boolean;
  payment_status: string;
  cover_image?: string; // Added cover_image field
}
