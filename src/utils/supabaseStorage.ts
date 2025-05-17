
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
 * Generates a placeholder URL for menu items with no images
 * @returns A placeholder URL string
 */
export const getDefaultFoodPlaceholder = (): string => {
  // Use a simple colored background instead of an external image
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23888'%3ENo Image%3C/text%3E%3C/svg%3E";
};

// Import here to avoid circular dependencies
import { supabase } from '@/lib/supabaseClient';
