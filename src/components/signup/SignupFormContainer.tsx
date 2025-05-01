
import SignupForm, { SignupFormValues } from "@/components/signup/SignupForm";
import PaymentForm from "@/components/signup/PaymentForm";

interface SignupFormContainerProps {
  showPaymentForm: boolean;
  isLoading: boolean;
  userDetails: SignupFormValues | null;
  membershipFee: number;
  handleSignupSubmit: (values: SignupFormValues) => Promise<void>;
  handlePayment: (e: React.FormEvent) => void;
  handleBack: () => void;
}

const SignupFormContainer = ({
  showPaymentForm,
  isLoading,
  userDetails,
  membershipFee,
  handleSignupSubmit,
  handlePayment,
  handleBack
}: SignupFormContainerProps) => {
  if (showPaymentForm) {
    return (
      <PaymentForm 
        userDetails={userDetails!}
        membershipFee={membershipFee}
        onBack={handleBack}
        onSubmit={handlePayment}
        isLoading={isLoading}
        isSubscription={true}
      />
    );
  }
  
  return (
    <SignupForm 
      onSubmit={handleSignupSubmit} 
      isLoading={isLoading}
    />
  );
};

export default SignupFormContainer;
