
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StripePaymentForm from "./stripe/StripePaymentForm";

// Add a new component to display existing membership info
interface MembershipNoticeProps {
  existingMembership: any;
  proratedAmount: number | null;
}

const MembershipNotice = ({ existingMembership, proratedAmount }: MembershipNoticeProps) => {
  if (!existingMembership || !existingMembership.remainingDays) return null;
  
  // Only show if user exists (prevents showing for non-existent users)
  if (!existingMembership.userExists) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
      <h3 className="text-amber-800 font-medium mb-2">Existing Membership Detected</h3>
      
      {proratedAmount === 0 ? (
        <p className="text-amber-700">
          You already have an active membership. There's no need to sign up again at this time.
        </p>
      ) : (
        <p className="text-amber-700">
          You'll be charged a prorated amount of ${proratedAmount?.toFixed(2) || '25.00'} for this renewal.
        </p>
      )}
      
      {existingMembership.remainingDays > 0 && (
        <p className="mt-2 text-amber-700">
          Your current membership has {existingMembership.remainingDays} days remaining.
        </p>
      )}
    </div>
  );
};

// Update the PaymentContentArea component to include this notice
interface PaymentContentAreaProps {
  paymentSuccess: boolean;
  sessionId: string | null;
  paymentCanceled: boolean;
  networkError: string | null;
  formErrors: {
    cardNumber?: boolean;
    cardExpiry?: boolean;
    cardCvc?: boolean;
  };
  stripeError: string | null;
  validationError: string | null;
  directClientSecret: string | null;
  isProcessing: boolean;
  membershipFee: number;
  handlePaymentSuccess: () => void;
  handlePaymentError: (errorMessage: string) => void;
  handleSubmit: (values: any) => Promise<void>;
  handleCancel: () => void;
  clientSecret: string | null;
  existingMembership?: any;
  proratedAmount?: number | null;
}

const PaymentContentArea = ({
  paymentSuccess,
  sessionId,
  paymentCanceled,
  networkError,
  formErrors,
  stripeError,
  validationError,
  directClientSecret,
  isProcessing,
  membershipFee,
  handlePaymentSuccess,
  handlePaymentError,
  handleSubmit,
  handleCancel,
  clientSecret,
  existingMembership,
  proratedAmount
}: PaymentContentAreaProps) => {
  const email = localStorage.getItem('signup_email') || '';
  
  // Only show membership notice if it's a valid existing membership with remaining days
  // and the user actually exists in the system
  const showMembershipNotice = existingMembership && 
                              existingMembership.hasOwnProperty('remainingDays') && 
                              existingMembership.remainingDays > 0 &&
                              existingMembership.userExists === true;
  
  return (
    <div className="container-custom">
      <Card className="max-w-xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {paymentSuccess ? "Payment Successful!" : "Complete Your Membership"}
          </CardTitle>
          <CardDescription>
            {paymentSuccess 
              ? "Thank you for your payment. Your membership is being activated." 
              : `Join our exclusive dining community for $${membershipFee.toFixed(2)}/month`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {networkError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{networkError}</AlertDescription>
            </Alert>
          )}
          
          {validationError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          {showMembershipNotice && (
            <MembershipNotice 
              existingMembership={existingMembership} 
              proratedAmount={proratedAmount} 
            />
          )}
          
          {paymentSuccess ? (
            <p className="text-center text-green-500 font-bold">
              Payment successful!
            </p>
          ) : paymentCanceled ? (
            <p className="text-center text-red-500 font-bold">
              Payment canceled.
            </p>
          ) : directClientSecret ? (
            <StripePaymentForm
              clientSecret={directClientSecret}
              email={email}
              isProcessing={isProcessing}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          ) : clientSecret ? (
            <StripePaymentForm
              clientSecret={clientSecret}
              email={email}
              isProcessing={isProcessing}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit({});
            }}>
              <button 
                type="submit" 
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Subscribe Now'}
              </button>
            </form>
          )}
          <div className="flex justify-center mt-4">
            <button 
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentContentArea;
