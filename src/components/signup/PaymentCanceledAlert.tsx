
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const PaymentCanceledAlert = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Payment was canceled. Please try again when you're ready.
      </AlertDescription>
    </Alert>
  );
};

export default PaymentCanceledAlert;
