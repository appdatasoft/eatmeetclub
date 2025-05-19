
/**
 * Shared type definitions for the fetch client
 */

export interface FetchClientOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
  cacheTime?: number;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackToSupabase?: boolean;
  supabseFallbackFn?: () => Promise<any>;
  background?: boolean;
  signal?: AbortSignal;
}

export interface FetchResponse<T = any> {
  data: T | null;
  error: Error | null;
  status?: number;
  headers?: Headers;
}

// Contract template types matching the Supabase schema
export interface ContractTemplate {
  id: string;
  name: string;
  description?: string;
  content?: string;
  type: "restaurant" | "restaurant_referral" | "ticket_sales";
  variables?: Record<string, unknown> | string;
  version?: string;
  is_active?: boolean;
  updated_at?: string;
  created_at?: string;
  storage_path: string;
  updated_by?: string;
  created_by?: string;
}
