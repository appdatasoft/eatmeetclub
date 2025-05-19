
// Contract template types matching the Supabase schema
export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  content?: string;
  type: "restaurant" | "restaurant_referral" | "ticket_sales";
  variables?: any[];
  version?: string;
  is_active?: boolean;
  updated_at?: string;
  created_at?: string;
  storage_path: string;
  updated_by?: string;
  created_by?: string;
}

export interface ContractVariable {
  name: string;
  label: string;
  description?: string;
  type: string;
  required?: boolean;
  default_value?: any;
}

// Default fields available for template variables
export const DEFAULT_AVAILABLE_FIELDS: ContractVariable[] = [
  { name: 'restaurant_name', label: 'Restaurant Name', type: 'string', required: true },
  { name: 'restaurant_address', label: 'Restaurant Address', type: 'string', required: true },
  { name: 'restaurant_city', label: 'Restaurant City', type: 'string', required: true },
  { name: 'restaurant_state', label: 'Restaurant State', type: 'string', required: true },
  { name: 'restaurant_zip', label: 'Restaurant Zip', type: 'string', required: true },
  { name: 'contact_name', label: 'Contact Name', type: 'string', required: true },
  { name: 'contact_email', label: 'Contact Email', type: 'string', required: true },
  { name: 'contact_phone', label: 'Contact Phone', type: 'string', required: true },
  { name: 'current_date', label: 'Current Date', type: 'date', required: false, default_value: new Date().toLocaleDateString() }
];
