
/**
 * Hook for managing user data in local storage during payment verification
 */
export const useUserStorage = () => {
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
  
  /**
   * Clear user details from local storage
   */
  const clearUserDetails = () => {
    localStorage.removeItem('signup_email');
    localStorage.removeItem('signup_name');
    localStorage.removeItem('signup_phone');
    localStorage.removeItem('signup_address');
    sessionStorage.removeItem('checkout_initiated');
  };
  
  return {
    getUserDetails,
    clearUserDetails
  };
};
