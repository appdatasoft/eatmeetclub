import { FeeConfig } from '@/hooks/admin/useAdminFees';

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  content: string;
  variables: Record<string, unknown> | string;
  version: string;
  is_active: boolean;
  storage_path: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
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
  
  // Fee configuration fields with clearer labels
  { name: 'restaurant_monthly_fee', label: 'Monthly Fee', description: 'The monthly fee charged to restaurants' },
  { name: 'signup_commission_value', label: 'Signup Commission', description: 'Commission value for signing up venues' },
  { name: 'signup_commission_type', label: 'Signup Commission Type', description: 'Commission type (flat or percentage) for signing up venues' },
  { name: 'ticket_commission_value', label: 'Ticket Commission', description: 'Commission value on ticket sales' },
  { name: 'ticket_commission_type', label: 'Ticket Commission Type', description: 'Commission type (flat or percentage) on ticket sales' },
  
  // New date-related fields
  { name: 'current_date', label: 'Today\'s Date', description: 'The current date (today)' },
  { name: 'current_month', label: 'Current Month', description: 'The current month name' },
  { name: 'days_in_month', label: 'Days in Current Month', description: 'Number of days in the current month' }
];

export interface ContractVariable {
  name: string;
  label: string;
  description?: string;
}

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
  current_date?: string;
  current_month?: string;
  days_in_month?: number;
  [key: string]: any;
}

// New interface for user data for email dropdown
export interface UserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  displayName: string; // Combines first name, last name and email
}

// New interface for email data
export interface EmailTemplateData {
  subject: string;
  recipients: string[];
  templateId?: string;
  content?: string;
}
