
import { FeeConfig } from '@/hooks/admin/useAdminFees';

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  content: string;
  variables: Record<string, unknown>;
  version: string;
  is_active: boolean;
  storage_path: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ContractVariable {
  name: string;
  label: string;
  description?: string;
}

export const DEFAULT_AVAILABLE_FIELDS: ContractVariable[] = [
  { name: 'restaurant_name', label: 'Restaurant Name', description: 'The name of the restaurant' },
  { name: 'restaurant_address', label: 'Restaurant Address', description: 'Full address of the restaurant' },
  { name: 'owner_name', label: 'Owner Name', description: 'Name of the restaurant owner' },
  { name: 'owner_email', label: 'Owner Email', description: 'Email of the restaurant owner' },
  { name: 'signing_date', label: 'Signing Date', description: 'Date when the contract was signed' },
  { name: 'event_name', label: 'Event Name', description: 'Name of the event' },
  { name: 'event_date', label: 'Event Date', description: 'Date of the event' },
  { name: 'ticket_price', label: 'Ticket Price', description: 'Price of the event ticket' },
  { name: 'sales_rep_name', label: 'Sales Rep Name', description: 'Name of the sales representative' },
  
  // Fee configuration fields - updated labels as requested
  { name: 'restaurant_monthly_fee', label: 'The monthly fee charged to restaurants', description: 'Monthly fee charged to restaurants' },
  { name: 'signup_commission_value', label: 'Commission for signing up venues', description: 'Commission value for signing up venues' },
  { name: 'signup_commission_type', label: 'Signup Commission Type', description: 'Commission type (flat or percentage) for signing up venues' },
  { name: 'ticket_commission_value', label: 'Commission on ticket sales', description: 'Commission value on ticket sales' },
  { name: 'ticket_commission_type', label: 'Ticket Commission Type', description: 'Commission type (flat or percentage) on ticket sales' }
];

export interface ContractTemplateContext {
  restaurant?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipcode: string;
    owner: {
      name: string;
      email: string;
    }
  };
  event?: {
    name: string;
    date: string;
    ticket_price: number;
  };
  sales_rep?: {
    name: string;
    email: string;
  };
  fees?: FeeConfig;
  signing_date?: string;
  [key: string]: any;
}
