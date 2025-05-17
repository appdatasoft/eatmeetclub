
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel?: () => void;
  isLoading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ onCancel, isLoading }) => {
  return (
    <div className="flex justify-end gap-2 pt-2">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Item'}
      </Button>
    </div>
  );
};

export default FormActions;
