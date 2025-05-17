
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard } from "lucide-react";

interface PaymentFormActionsProps {
  onBack: () => void;
  isLoading: boolean;
  isFormValid: boolean;
}

const PaymentFormActions = ({
  onBack,
  isLoading,
  isFormValid
}: PaymentFormActionsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onBack}
        disabled={isLoading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || !isFormValid}
        className="flex items-center"
      >
        {isLoading ? (
          "Processing..."
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Complete Payment
          </>
        )}
      </Button>
    </div>
  );
};

export default PaymentFormActions;
