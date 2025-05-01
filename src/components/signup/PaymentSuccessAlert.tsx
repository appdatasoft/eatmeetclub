
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

const PaymentSuccessAlert = () => {
  return (
    <Alert className="mb-4 bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
      <AlertDescription className="text-green-800">
        Payment successful! Your membership has been activated. You'll be redirected to login shortly.
      </AlertDescription>
    </Alert>
  );
};

export default PaymentSuccessAlert;
