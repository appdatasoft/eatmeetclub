
import { Form } from "@/components/ui/form";
import { SignupFormValues } from "./SignupForm";
import PaymentFormFields from "./payment/PaymentFormFields";
import PaymentSummary from "./payment/PaymentSummary";
import PaymentFormActions from "./payment/PaymentFormActions";
import usePaymentForm from "./payment/usePaymentForm";

interface PaymentFormProps {
  userDetails: SignupFormValues;
  membershipFee: number;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isSubscription?: boolean;
  requireAllFields?: boolean;
}

const PaymentForm = ({
  userDetails,
  membershipFee,
  onBack,
  onSubmit,
  isLoading,
  isSubscription = false,
  requireAllFields = false
}: PaymentFormProps) => {
  const { form, formData, handleInputChange, isFormValid } = usePaymentForm({
    userDetails,
    requireAllFields
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Hidden fields to store the actual values for submission */}
          <input type="hidden" id="firstName" name="firstName" value={formData.firstName} />
          <input type="hidden" id="lastName" name="lastName" value={formData.lastName} />
          <input type="hidden" id="email" name="email" value={formData.email} />
          <input type="hidden" id="phone" name="phone" value={formData.phone} />
          <input type="hidden" id="address" name="address" value={formData.address} />

          <PaymentFormFields 
            form={form} 
            handleInputChange={handleInputChange} 
            requireAllFields={requireAllFields} 
          />

          <PaymentSummary 
            membershipFee={membershipFee} 
            isSubscription={isSubscription} 
          />

          <PaymentFormActions 
            onBack={onBack} 
            isLoading={isLoading} 
            isFormValid={isFormValid} 
          />
        </form>
      </Form>
    </div>
  );
};

export default PaymentForm;
