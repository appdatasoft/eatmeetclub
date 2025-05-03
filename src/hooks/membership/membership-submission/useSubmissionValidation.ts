
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for validating membership submission data
 */
export const useSubmissionValidation = () => {
  const { toast } = useToast();
  
  /**
   * Validate required fields
   */
  const validateSubmissionFields = (values: { email?: string; name?: string }) => {
    if (!values.email) {
      throw new Error("Email is required");
    }
    
    if (!values.name) {
      throw new Error("Name is required");
    }
    
    return true;
  };
  
  /**
   * Show toast message for submission in progress
   */
  const showSubmissionInProgressToast = () => {
    toast({
      title: "Processing",
      description: "Your membership request is already being processed",
    });
  };
  
  return {
    validateSubmissionFields,
    showSubmissionInProgressToast
  };
};

export default useSubmissionValidation;
