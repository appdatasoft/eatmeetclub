
export interface EventDetails {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  capacity: number;
  restaurant: {
    id?: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    description: string;
  };
  tickets_sold?: number;
  user_id: string;
  cover_image?: string;
  published: boolean;
}

export interface EventDetailsResponse {
  event: EventDetails | null;
  isLoading: boolean;
  error: string | null;
  isCurrentUserOwner: boolean;
  refreshEventDetails: () => Promise<void>;
}
