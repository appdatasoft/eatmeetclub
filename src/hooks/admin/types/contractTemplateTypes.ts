// Keep existing types, but ensure UserOption interface exists
// This file might already have other types, we're just making sure UserOption is defined correctly

export interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  content: string;
  type: string;
  description?: string;
  variables?: Record<string, any> | string;
  version?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  storage_path?: string;
}

export interface ContractVariable {
  name: string;
  label: string;
  description?: string;
  type?: string;
}

// Default available fields for templates
export const DEFAULT_AVAILABLE_FIELDS: ContractVariable[] = [
  { name: 'restaurant_monthly_fee', label: 'Restaurant Monthly Fee' },
  { name: 'signup_commission_value', label: 'Signup Commission Value' },
  { name: 'signup_commission_type', label: 'Signup Commission Type' },
  { name: 'ticket_commission_value', label: 'Ticket Commission Value' },
  { name: 'ticket_commission_type', label: 'Ticket Commission Type' },
  { name: 'current_date', label: 'Current Date' },
  { name: 'current_month', label: 'Current Month' },
  { name: 'days_in_month', label: 'Days in Month' }
];
