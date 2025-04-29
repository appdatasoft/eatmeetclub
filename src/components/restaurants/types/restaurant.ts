
// This is already defined and we want to make sure we're using it consistently
export interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  website: string | null;
}
