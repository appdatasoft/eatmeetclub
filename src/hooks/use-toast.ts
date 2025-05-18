
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

export const useToast = () => {
  const showToast = ({ title, description, variant, action }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title, {
        description,
        action
      });
    } else {
      sonnerToast(title, {
        description,
        action
      });
    }
  };

  return {
    toast: showToast,
    toasts: [] // Add this to fix the toaster.tsx error
  };
};

// Export the toast function directly
export const toast = (title?: string, options?: any) => {
  sonnerToast(title, options);
};
