
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="rounded-md bg-red-50 p-4 text-center">
      <p className="text-red-800">{error}</p>
      <Button 
        variant="outline" 
        className="mt-2" 
        onClick={onRetry}
      >
        Try Again
      </Button>
    </div>
  );
};

export default ErrorState;
