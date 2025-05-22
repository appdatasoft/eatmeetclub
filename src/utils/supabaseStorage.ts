
/**
 * Adds a cache buster to a URL to prevent caching issues with images
 */
export const addCacheBuster = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return url;
  }
  
  try {
    // Check if the URL is valid before proceeding
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return url;
    }
    
    const cacheBuster = `cache=${Date.now()}`;
    
    // Handle URLs that already have query parameters
    if (url.includes('?')) {
      return `${url}&${cacheBuster}`;
    }
    
    // Add query parameters to URLs without them
    return `${url}?${cacheBuster}`;
  } catch (error) {
    console.error("Error adding cache buster to URL", error);
    return url; // Return original URL if there's an error
  }
};

/**
 * Returns a default food placeholder image
 */
export const getDefaultFoodPlaceholder = (): string => {
  return "/lovable-uploads/e68dd733-6a42-426b-8156-7c0a0963b7d2.png";
};
