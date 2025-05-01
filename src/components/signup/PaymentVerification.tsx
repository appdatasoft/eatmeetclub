
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentVerificationProps {
  isVerifying: boolean;
  isVerified: boolean;
  isNotificationSent: boolean;
}

export const PaymentVerification = ({ isVerifying, isVerified, isNotificationSent }: PaymentVerificationProps) => {
  if (isVerifying) {
    return (
      <div className="text-center py-6">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your payment...</p>
      </div>
    );
  }
  
  if (isNotificationSent && !isVerifying && !isVerified) {
    return (
      <Alert className="mb-4 bg-green-50 border-green-200">
        <AlertDescription className="text-green-800">
          We've sent you a confirmation email and text message! Please proceed to payment to complete your membership.
        </AlertDescription>
      </Alert>
    );
  }
  
  return null;
};
