
/**
 * Hook for handling user data storage in localStorage and sessionStorage
 */
export const useUserStorage = () => {
  /**
   * Stores user details in both localStorage and sessionStorage
   */
  const storeUserDetails = (
    email: string, 
    name: string, 
    phone?: string, 
    address?: string
  ) => {
    // Store all details in BOTH localStorage and sessionStorage for redundancy
    // localStorage
    localStorage.setItem('signup_email', email);
    localStorage.setItem('signup_name', name || '');
    if (phone) localStorage.setItem('signup_phone', phone);
    if (address) localStorage.setItem('signup_address', address);
    
    // sessionStorage (backup)
    sessionStorage.setItem('signup_email', email);
    sessionStorage.setItem('signup_name', name || '');
    if (phone) sessionStorage.setItem('signup_phone', phone);
    if (address) sessionStorage.setItem('signup_address', address);
    
    // Double check that email is stored to avoid verification issues
    if (!localStorage.getItem('signup_email')) {
      console.error("Failed to store email in localStorage");
      localStorage.setItem('signup_email', email);
      
      // Check once more
      if (!localStorage.getItem('signup_email')) {
        console.error("Still failed to store email in localStorage, falling back to sessionStorage only");
      }
    }
  };
  
  /**
   * Verifies that user details are properly stored
   */
  const verifyStoredDetails = (email: string) => {
    // Double check that email is stored in both locations
    const checkLocalEmail = localStorage.getItem('signup_email');
    const checkSessionEmail = sessionStorage.getItem('signup_email');
    
    if (!checkLocalEmail && checkSessionEmail) {
      console.log("Email missing from localStorage but found in sessionStorage, restoring");
      localStorage.setItem('signup_email', checkSessionEmail);
    } else if (!checkLocalEmail && !checkSessionEmail) {
      console.error("Email not found in any storage, saving again before redirect");
      localStorage.setItem('signup_email', email);
      sessionStorage.setItem('signup_email', email);
    }
    
    return {
      isStoredInLocal: !!localStorage.getItem('signup_email'),
      isStoredInSession: !!sessionStorage.getItem('signup_email')
    };
  };
  
  /**
   * Clears user details from storage
   */
  const clearUserDetails = () => {
    localStorage.removeItem('signup_email');
    localStorage.removeItem('signup_name');
    localStorage.removeItem('signup_phone');
    localStorage.removeItem('signup_address');
    sessionStorage.removeItem('checkout_initiated');
  };

  /**
   * Get user details from local storage
   */
  const getUserDetails = () => {
    const email = localStorage.getItem('signup_email');
    const name = localStorage.getItem('signup_name') || (email ? email.split('@')[0] : 'Member');
    const phone = localStorage.getItem('signup_phone');
    const address = localStorage.getItem('signup_address');
    
    return { email, name, phone, address };
  };

  return {
    storeUserDetails,
    verifyStoredDetails,
    clearUserDetails,
    getUserDetails
  };
};

export default useUserStorage;
