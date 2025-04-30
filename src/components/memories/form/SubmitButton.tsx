
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  isLoading: boolean;
  isUploading: boolean;
  isEditMode: boolean;
}

const SubmitButton = ({ isLoading, isUploading, isEditMode }: SubmitButtonProps) => {
  const isDisabled = isLoading || isUploading;
  const buttonText = isEditMode ? 'Update Memory' : 'Create Memory';
  const loadingText = isEditMode ? 'Updating Memory...' : 'Creating Memory...';

  return (
    <Button 
      type="submit" 
      disabled={isDisabled}
      className="w-full"
    >
      {isDisabled ? (
        <>
          <span className="animate-spin mr-2">⌛</span> 
          {loadingText}
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default SubmitButton;
