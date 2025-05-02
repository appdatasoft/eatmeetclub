
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onCancel: () => void;
  isProcessing: boolean;
  formSubmitted?: boolean;
}

const FormActions = ({ onCancel, isProcessing, formSubmitted = false }: FormActionsProps) => {
  if (formSubmitted) {
    return null;
  }

  return (
    <div className="flex justify-between mt-6">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Continue"}
      </Button>
    </div>
  );
};

export default FormActions;
