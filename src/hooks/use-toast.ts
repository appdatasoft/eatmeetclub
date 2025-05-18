
import { toast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
};

export const useToast = () => {
  const showToast = ({ title, description, variant, action }: ToastProps) => {
    if (variant === "destructive") {
      toast.error(title, {
        description,
        action
      });
    } else {
      toast(title, {
        description,
        action
      });
    }
  };

  return {
    toast: showToast,
  };
};
