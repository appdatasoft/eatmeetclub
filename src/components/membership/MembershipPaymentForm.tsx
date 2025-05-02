
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import MembershipBenefits from "./MembershipBenefits";
import MembershipFormFields from "./MembershipFormFields";
import FormActions from "./FormActions";
import PaymentSection from "./PaymentSection";

export const membershipSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }).optional(),
  address: z.string().min(5, { message: "Please enter your address" }),
});

export type MembershipFormValues = z.infer<typeof membershipSchema>;

interface MembershipPaymentFormProps {
  membershipFee: number;
  onSubmit: (values: MembershipFormValues) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
  clientSecret: string | null;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}

const MembershipPaymentForm = ({ 
  membershipFee, 
  onSubmit, 
  onCancel, 
  isProcessing,
  clientSecret,
  onPaymentSuccess,
  onPaymentError
}: MembershipPaymentFormProps) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const handleFormSubmit = async (values: MembershipFormValues) => {
    setValidationError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const email = form.watch("email");
  const formSubmitted = clientSecret !== null;

  return (
    <>
      <MembershipBenefits />
      
      <div className="border-t border-gray-200 pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <MembershipFormFields form={form} disabled={formSubmitted} />
            
            <FormActions 
              onCancel={onCancel} 
              isProcessing={isProcessing || isSubmitting} 
              formSubmitted={formSubmitted} 
            />
            
            <PaymentSection 
              clientSecret={clientSecret}
              email={email}
              isProcessing={isProcessing}
              onPaymentSuccess={onPaymentSuccess}
              onPaymentError={onPaymentError}
            />
          </form>
        </Form>
      </div>
    </>
  );
};

export default MembershipPaymentForm;
