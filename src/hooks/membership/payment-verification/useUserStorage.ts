
import { useUserStorage as useMainUserStorage } from "../useUserStorage";

/**
 * Hook for managing user data in local storage during payment verification
 * This is a wrapper around the main useUserStorage hook for backward compatibility
 */
export const useUserStorage = () => {
  // Import main hook's functionality
  const mainUserStorage = useMainUserStorage();
  
  // Return only the methods used in payment verification
  return {
    getUserDetails: mainUserStorage.getUserDetails,
    clearUserDetails: mainUserStorage.clearUserDetails,
    storeUserDetails: mainUserStorage.storeUserDetails
  };
};

export default useUserStorage;
