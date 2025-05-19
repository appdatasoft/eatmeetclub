
/**
 * Types for contract templates
 */

export interface ContractVariable {
  id: string;
  name: string;
  type: string;
  value?: string;
  label?: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: "restaurant" | "restaurant_referral" | "ticket_sales";
  variables: ContractVariable[];
  version?: string;
  is_active?: boolean;
  updated_at?: string;
  created_at?: string;
  storage_path: string;
  created_by?: string;
  updated_by?: string;
}

export const DEFAULT_AVAILABLE_FIELDS: ContractVariable[] = [
  { id: "restaurant.name", name: "restaurant.name", label: "Restaurant Name", type: "text" },
  { id: "restaurant.address", name: "restaurant.address", label: "Restaurant Address", type: "text" },
  { id: "restaurant.city", name: "restaurant.city", label: "Restaurant City", type: "text" },
  { id: "restaurant.state", name: "restaurant.state", label: "Restaurant State", type: "text" },
  { id: "restaurant.zipcode", name: "restaurant.zipcode", label: "Restaurant Zip", type: "text" },
  { id: "restaurant.phone", name: "restaurant.phone", label: "Restaurant Phone", type: "text" },
  { id: "user.fullName", name: "user.fullName", label: "User Full Name", type: "text" },
  { id: "user.email", name: "user.email", label: "User Email", type: "email" },
  { id: "contract.date", name: "contract.date", label: "Contract Date", type: "date" },
  { id: "contract.term", name: "contract.term", label: "Contract Term", type: "number" },
  { id: "payment.amount", name: "payment.amount", label: "Payment Amount", type: "currency" },
  { id: "payment.date", name: "payment.date", label: "Payment Date", type: "date" },
];
