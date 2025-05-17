
/**
 * Utility functions for working with Supabase storage URLs
 */

/**
 * Adds a cache-busting parameter to a Supabase storage URL
 * @param url The original storage URL
 * @returns The URL with a cache-busting parameter
 */
export const addCacheBuster = (url: string): string => {
  if (!url) return url;
  
  try {
    // Add a timestamp to bust cache
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const parameter = `t=${timestamp}_${randomString}`;
    return url.includes('?') ? `${url}&${parameter}` : `${url}?${parameter}`;
  } catch (error) {
    console.error('Error adding cache buster to URL', error);
    return url;
  }
};

/**
 * Builds a safe storage URL with proper error handling
 * @param bucket The storage bucket name
 * @param path The file path within the bucket
 * @param fallback Optional fallback URL if the original is invalid
 * @returns A properly formatted storage URL
 */
export const buildStorageUrl = (
  bucket: string,
  path: string | null | undefined,
  fallback?: string
): string => {
  if (!path) return fallback || '';
  
  try {
    // Normalize path by removing leading slash
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Build the URL using the Supabase project reference
    const storageUrl = `https://wocfwpedauuhlrfugxuu.supabase.co/storage/v1/object/public/${bucket}/${normalizedPath}`;
    
    // Add cache busting parameter
    return addCacheBuster(storageUrl);
  } catch (error) {
    console.error('Error building storage URL', error);
    return fallback || '';
  }
};

/**
 * Extract the file path from a complete Supabase storage URL
 * @param url The complete URL from Supabase storage
 * @returns The extracted file path
 */
export const extractPathFromStorageUrl = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const regex = /\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(?:\?.*)?$/;
    const match = url.match(regex);
    
    if (!match || match.length < 3) return null;
    
    const bucket = match[1];
    const path = match[2];
    
    return `${bucket}/${path}`;
  } catch (error) {
    console.error('Error extracting path from storage URL', error);
    return null;
  }
};

/**
 * Check if a URL is a Supabase storage URL
 * @param url The URL to check
 * @returns Whether the URL is a Supabase storage URL
 */
export const isStorageUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes('/storage/v1/object/public/');
};

/**
 * Checks if a storage URL exists and is accessible
 * @param url The URL to check
 * @returns Promise resolving to boolean indicating if the URL is accessible
 */
export const checkStorageUrlExists = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // Use HEAD request to check if the file exists without downloading it
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('Error checking if storage URL exists:', error);
    return false;
  }
};

/**
 * Generates alternative URL patterns to try for a given item ID
 * @param restaurantId The restaurant ID
 * @param itemId The menu item ID
 * @returns Array of possible URL patterns to try
 */
export const generateAlternativeUrls = (
  restaurantId: string,
  itemId: string
): string[] => {
  const bucket = 'lovable-uploads';
  const baseStorageUrl = `https://wocfwpedauuhlrfugxuu.supabase.co/storage/v1/object/public/${bucket}`;
  const extensions = ['jpg', 'jpeg', 'png', 'webp'];
  
  const urls: string[] = [];
  
  // Try different patterns with different extensions
  extensions.forEach(ext => {
    // Direct ID as filename
    urls.push(`${baseStorageUrl}/${itemId}.${ext}`);
    
    // ID in restaurant-specific folder
    urls.push(`${baseStorageUrl}/menu-items/${restaurantId}/${itemId}.${ext}`);
    
    // ID in general menu-items folder
    urls.push(`${baseStorageUrl}/menu-items/${itemId}.${ext}`);
    
    // Combined restaurant and item IDs
    urls.push(`${baseStorageUrl}/${restaurantId}-${itemId}.${ext}`);
    
    // Try with menu-items prefix
    urls.push(`${baseStorageUrl}/menu-items/${restaurantId}/${itemId}/main.${ext}`);
    urls.push(`${baseStorageUrl}/menu-items/${restaurantId}/${itemId}/thumbnail.${ext}`);
    
    // Try with public folder
    urls.push(`${baseStorageUrl}/public/${itemId}.${ext}`);
    urls.push(`${baseStorageUrl}/public/menu-items/${itemId}.${ext}`);
    
    // Try with restaurants folder
    urls.push(`${baseStorageUrl}/restaurants/${restaurantId}/menu/${itemId}.${ext}`);
  });
  
  return urls.map(url => addCacheBuster(url));
};

/**
 * Generates a placeholder URL for menu items with no images
 * @returns A placeholder URL string
 */
export const getDefaultFoodPlaceholder = (): string => {
  // Return a static public URL that we know works (avoiding Supabase storage for fallback)
  return "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=500&h=500";
};

/**
 * Try to get a working image URL from multiple alternatives
 * @param restaurantId The restaurant ID  
 * @param itemId The menu item ID
 * @returns Promise resolving to a working URL or null
 */
export const findWorkingImageUrl = async (
  restaurantId: string, 
  itemId: string
): Promise<string | null> => {
  const urls = generateAlternativeUrls(restaurantId, itemId);
  
  console.log(`Attempting to find working image for item ${itemId} with ${urls.length} alternatives`);
  
  // Check the first few URLs more quickly with HEAD requests
  for (let i = 0; i < Math.min(urls.length, 4); i++) {
    const exists = await checkStorageUrlExists(urls[i]);
    if (exists) {
      console.log(`Found working image URL: ${urls[i]}`);
      return urls[i];
    }
  }
  
  return null;
};
