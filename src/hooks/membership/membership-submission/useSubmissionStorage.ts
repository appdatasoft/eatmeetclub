
import { useState } from "react";

/**
 * Hook for managing state related to submission process
 */
export const useSubmissionStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  /**
   * Check if a submission is already in progress
   */
  const isSubmissionInProgress = () => {
    return isLoading || isSubmitted || sessionStorage.getItem('checkout_initiated') === 'true';
  };
  
  /**
   * Mark checkout as initiated to prevent duplicate submissions
   */
  const markCheckoutInitiated = () => {
    sessionStorage.setItem('checkout_initiated', 'true');
    setIsSubmitted(true);
  };
  
  return {
    isLoading,
    isSubmitted,
    setIsLoading,
    setIsSubmitted,
    isSubmissionInProgress,
    markCheckoutInitiated
  };
};

export default useSubmissionStorage;
