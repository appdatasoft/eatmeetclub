
import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignupFormValues } from "./SignupForm";

interface PaymentFormProps {
  userDetails: SignupFormValues;
  membershipFee: number;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const PaymentForm = ({
  userDetails,
  membershipFee,
  onBack,
  onSubmit,
  isLoading
}: PaymentFormProps) => {
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const formatCardNumber = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format with spaces every 4 digits
    let formatted = '';
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += digits[i];
    }
    
    // Limit to 19 characters (16 digits + 3 spaces)
    return formatted.slice(0, 19);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };

  const formatExpiryDate = (value: string) => {
    // Remove any non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    return digits;
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setCardExpiry(formattedValue);
  };

  return (
    <>
      <div className="mb-6">
        <h3 className="font-medium mb-2">Membership Details</h3>
        <p className="text-sm text-gray-600">Email: {userDetails?.email}</p>
        {userDetails?.phoneNumber && (
          <p className="text-sm text-gray-600">Phone: {userDetails.phoneNumber}</p>
        )}
      </div>
      
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <p className="text-amber-800 text-sm">
            You will be charged ${membershipFee.toFixed(2)} for your membership.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            required
            placeholder="1234 5678 9012 3456"
            className="mt-1"
            maxLength={19}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cardExpiry">Expiry Date</Label>
            <Input
              id="cardExpiry"
              type="text"
              value={cardExpiry}
              onChange={handleExpiryDateChange}
              required
              placeholder="MM/YY"
              className="mt-1"
              maxLength={5}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cardCvc">CVC</Label>
            <Input
              id="cardCvc"
              type="password"
              value={cardCvc}
              onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              required
              placeholder="123"
              className="mt-1"
              maxLength={4}
            />
          </div>
        </div>

        <div className="pt-4 flex space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={onBack}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className="flex-1"
          >
            Pay ${membershipFee.toFixed(2)}
          </Button>
        </div>
      </form>
    </>
  );
};

export default PaymentForm;
