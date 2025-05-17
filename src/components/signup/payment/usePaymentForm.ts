
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupFormValues } from "../SignupForm";
import { paymentFormSchema, requiredPaymentFormSchema, PaymentFormValues } from "./types";

interface UsePaymentFormProps {
  userDetails: SignupFormValues;
  requireAllFields?: boolean;
}

export const usePaymentForm = ({ 
  userDetails, 
  requireAllFields = false 
}: UsePaymentFormProps) => {
  const [formData, setFormData] = useState({
    firstName: userDetails.firstName || "",
    lastName: userDetails.lastName || "",
    email: userDetails.email || "",
    phone: userDetails.phoneNumber || "",
    address: userDetails.address || "",
  });

  const validationSchema = requireAllFields 
    ? requiredPaymentFormSchema
    : paymentFormSchema;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      firstName: userDetails.firstName || "",
      lastName: userDetails.lastName || "",
      email: userDetails.email || "",
      phone: userDetails.phoneNumber || "",
      address: userDetails.address || "",
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Update the hidden form fields used for submission
    const element = document.getElementById(field) as HTMLInputElement;
    if (element) {
      element.value = value;
    }
  };

  return {
    form,
    formData,
    handleInputChange,
    isFormValid: form.formState.isValid
  };
};

export default usePaymentForm;
