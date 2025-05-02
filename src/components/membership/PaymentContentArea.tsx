
import React from "react";
import PaymentAlerts from "./PaymentAlerts";
import StripePaymentElement from "./StripePaymentElement";
import MembershipPaymentForm from "./MembershipPaymentForm";

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
  handlePaymentError: (error: string) => void;
  handleSubmit: (values: any) => Promise<void>;
  handleCancel: () => void;
  clientSecret: string | null;
}

const PaymentContentArea: React.FC<PaymentContentAreaProps> = ({
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
  clientSecret
}) => {
  const finalPaymentSuccess = paymentSuccess;
  const finalSessionId = sessionId;
  
  return (
    <div className="container-custom">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-brand-500 text-white">
            <h1 className="text-2xl font-bold">Become a Member</h1>
            <p className="mt-1 text-white/90">Join our exclusive community for just ${membershipFee.toFixed(2)}/month</p>
          </div>
          
          <div className="p-6">
            <PaymentAlerts 
              paymentSuccess={finalPaymentSuccess}
              sessionId={finalSessionId}
              paymentCanceled={paymentCanceled}
              networkError={networkError}
              formErrors={formErrors}
              stripeError={stripeError}
              validationError={validationError}
            />
            
            {!finalPaymentSuccess && directClientSecret && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Complete your membership payment</h3>
                  <p className="mb-6">You're just one step away from joining our community!</p>
                  <StripePaymentElement
                    clientSecret={directClientSecret}
                    email={localStorage.getItem('signup_email') || 'guest@example.com'}
                    isProcessing={isProcessing}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </div>
              </>
            )}
            
            {!finalPaymentSuccess && !directClientSecret && !finalSessionId && (
              <MembershipPaymentForm
                membershipFee={membershipFee}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isProcessing={isProcessing}
                clientSecret={clientSecret}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentContentArea;
