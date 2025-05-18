
// In-memory request cache for very short-lived requests
export const requestCache = new Map<string, { data: any; expiry: number }>();
