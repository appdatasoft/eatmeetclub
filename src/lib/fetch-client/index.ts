
/**
 * Enhanced Fetch Client with optimized performance
 * Main exports file
 */

// Export types
export type { FetchClientOptions, FetchResponse, ContractTemplate } from "./types";

// Export core utilities
export { 
  fetchClient,
  get, 
  post, 
  put, 
  patch, 
  del, 
  prefetch 
} from "./core";

// Export caching utilities
export { clearCache } from "./cache";

// Export API services
export { templates } from "./templates-api";
