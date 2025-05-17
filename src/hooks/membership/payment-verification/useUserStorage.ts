
import { useUserStorage as useMainUserStorage } from "../useUserStorage";

/**
 * Hook for managing user data in local storage during payment verification
 * This is a wrapper around the main useUserStorage hook for backward compatibility
 */
export const useUserStorage = () => {
  // Import main hook's functionality
  const mainUserStorage = useMainUserStorage();
  
  // Add name and email properties for backward compatibility with tests
  return {
    getUserDetails: mainUserStorage.getUserDetails,
    clearUserDetails: mainUserStorage.clearUserDetails,
    storeUserDetails: mainUserStorage.storeUserDetails,
    // Add these properties to pass the tests
    get name() {
      return mainUserStorage.getUserDetails().name || '';
    },
    get email() {
      return mainUserStorage.getUserDetails().email || '';
    }
  };
};

export default useUserStorage;
