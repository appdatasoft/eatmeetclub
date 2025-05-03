
import { useSubmissionHandler } from "./membership-submission";

/**
 * Main hook for membership submission
 * This is a facade over the refactored submission functionality
 */
export const useMembershipSubmission = () => {
  // Use the refactored submission handler
  const { 
    isLoading, 
    isSubmitted, 
    handleMembershipSubmit, 
    setIsSubmitted 
  } = useSubmissionHandler();

  return {
    isLoading,
    isSubmitted,
    handleMembershipSubmit,
    setIsSubmitted
  };
};

export default useMembershipSubmission;
