
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/common/Button';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';

interface PaymentFormProps {
  amount: number;
  onSuccess: (details: any) => void;
  onCancel: () => void;
}

const PaymentForm = ({ amount, onSuccess, onCancel }: PaymentFormProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
    setCardDetails(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
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
    setCardDetails(prev => ({
      ...prev,
      expiryDate: formattedValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // This would normally be a call to a payment processor API
    setTimeout(() => {
      setIsProcessing(false);
      
      // Generate mock payment details
      const mockPaymentDetails = {
        id: `payment_${Date.now()}`,
        amount,
        status: 'succeeded',
        created: Date.now(),
      };

      toast({
        title: "Payment Successful",
        description: `Your payment of $${amount.toFixed(2)} has been processed.`
      });

      onSuccess(mockPaymentDetails);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <Input
          id="cardNumber"
          name="cardNumber"
          value={cardDetails.cardNumber}
          onChange={handleCardNumberChange}
          placeholder="1234 5678 9012 3456"
          required
          maxLength={19}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          name="cardholderName"
          value={cardDetails.cardholderName}
          onChange={handleInputChange}
          placeholder="John Doe"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            value={cardDetails.expiryDate}
            onChange={handleExpiryDateChange}
            placeholder="MM/YY"
            required
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            name="cvv"
            value={cardDetails.cvv}
            onChange={handleInputChange}
            type="password"
            placeholder="123"
            required
            maxLength={4}
          />
        </div>
      </div>
      
      <div className="pt-4">
        <p className="text-sm text-gray-500 mb-4">
          You will be charged ${amount.toFixed(2)} for creating this event.
        </p>
        <div className="flex space-x-2">
          <Button 
            type="submit"
            isLoading={isProcessing}
            className="flex-1"
          >
            Pay ${amount.toFixed(2)}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PaymentForm;
