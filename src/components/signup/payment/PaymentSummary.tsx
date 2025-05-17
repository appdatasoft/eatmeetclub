
import { Card, CardContent } from "@/components/ui/card";

interface PaymentSummaryProps {
  membershipFee: number;
  isSubscription?: boolean;
}

const PaymentSummary = ({ membershipFee, isSubscription = false }: PaymentSummaryProps) => {
  return (
    <Card className="bg-gray-50 border border-gray-200">
      <CardContent className="py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">Monthly Membership</p>
            {isSubscription && <p className="text-xs text-gray-500">Billed monthly</p>}
          </div>
          <p className="font-semibold">${membershipFee}.00</p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <p className="font-medium">Total</p>
          <p className="font-bold text-lg">${membershipFee}.00</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
