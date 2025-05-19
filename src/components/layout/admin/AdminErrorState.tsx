
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useNavigate } from 'react-router-dom';

interface AdminErrorStateProps {
  error: string;
  onRetry: () => void;
  isRetrying?: boolean;
}

const AdminErrorState = ({ error, onRetry, isRetrying = false }: AdminErrorStateProps) => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full text-center">
          <div className="mb-6 text-red-500">
            <AlertCircle size={50} className="mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Admin Access Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={onRetry} 
              disabled={isRetrying}
              className="relative"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span>Retrying...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>Retry</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminErrorState;
