
export interface Restaurant {
  id: string;
  name: string;
  user_id: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  website?: string;
  logo_url?: string;
  cuisine_type: string;
  created_at?: string;
  updated_at?: string;
  // Restaurant verification fields
  verification_status?: 'pending' | 'submitted' | 'verified' | 'rejected';
  ein_number?: string;
  business_license_number?: string;
  business_license_image_url?: string;
  drivers_license_image_url?: string;
  owner_name?: string;
  owner_ssn_last4?: string;
  owner_email?: string;
  verified_at?: string;
  verified_by?: string;
  // Restaurant settings
  default_ambassador_fee_percentage?: number;
  has_signed_contract?: boolean;
}
