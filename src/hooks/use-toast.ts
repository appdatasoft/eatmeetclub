
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

export const useToast = () => {
  const showToast = (props: ToastProps | string) => {
    // Handle string case for direct usage
    if (typeof props === 'string') {
      sonnerToast(props);
      return;
    }
    
    const { title, description, variant, action } = props;
    
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
    toasts: [] // Keep this to fix the toaster.tsx error
  };
};

// Export the toast function directly for convenience
export const toast = (props: ToastProps | string, options?: any) => {
  if (typeof props === 'string') {
    sonnerToast(props, options);
    return;
  }
  
  const { title, description, variant, action } = props;
  
  if (variant === "destructive") {
    sonnerToast.error(title, {
      description,
      action,
      ...options
    });
  } else {
    sonnerToast(title, {
      description,
      action,
      ...options
    });
  }
};
