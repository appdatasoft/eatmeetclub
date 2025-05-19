
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardLoadingStateProps {
  message?: string;
}

const DashboardLoadingState = ({ message = "Loading your dashboard..." }: DashboardLoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="md" text={message} />
    </div>
  );
};

export default DashboardLoadingState;
