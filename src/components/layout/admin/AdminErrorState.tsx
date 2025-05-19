
import { AlertCircle, RefreshCw, Database, Shield, RotateCcw, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface AdminErrorStateProps {
  error: string;
  onRetry: () => void;
  onForceReload?: () => void;
  isRetrying?: boolean;
  diagnostics?: Record<string, any> | null;
}

const AdminErrorState = ({ 
  error, 
  onRetry, 
  onForceReload,
  isRetrying = false, 
  diagnostics = null 
}: AdminErrorStateProps) => {
  const navigate = useNavigate();
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Format the error message for better readability
  let formattedError = error;
  let errorIcon = <AlertCircle size={50} className="mx-auto text-red-500" />;
  let possibleSolutions = (
    <ul className="text-blue-700 text-sm space-y-2 list-disc pl-5">
      <li>Check your internet connection</li>
      <li>Verify that you have admin privileges</li>
      <li>Try disabling any browser extensions that might block connections</li>
      <li>Clear browser cache and cookies</li>
    </ul>
  );
  
  // Handle specific error types
  if (error.includes('Unable to connect')) {
    formattedError = 'Unable to connect to database. Please check your connection.';
  } else if (error.includes('body stream already read')) {
    formattedError = 'Response stream error: The response was already read';
    errorIcon = <FileWarning size={50} className="mx-auto text-amber-500" />;
    possibleSolutions = (
      <ul className="text-blue-700 text-sm space-y-2 list-disc pl-5">
        <li>Try reloading the page</li>
        <li>Clear your browser cache</li>
        <li>This is often a temporary issue with response handling</li>
        <li>Use the Force Reload button below to clear cached responses</li>
      </ul>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-md w-full">
          <div className="mb-6 text-center">
            {errorIcon}
          </div>
          <h2 className="text-2xl font-bold mb-2 text-center">Admin Access Error</h2>
          <p className="text-gray-600 mb-6 text-center">{formattedError}</p>

          {/* Possible solutions */}
          <div className="mb-6 bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-800 mb-2">Possible Solutions:</h3>
            {possibleSolutions}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                Go to Dashboard
              </Button>
              <Button 
                onClick={onRetry} 
                disabled={isRetrying}
                className="relative w-full"
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
            
            {onForceReload && (
              <Button 
                onClick={onForceReload} 
                variant="secondary"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <span>Force Reload</span>
              </Button>
            )}
            
            {diagnostics && (
              <Button
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                variant="ghost"
                size="sm"
                className="mt-2"
              >
                <Database className="h-4 w-4 mr-2" />
                {showDiagnostics ? 'Hide' : 'Show'} Connection Details
              </Button>
            )}
          </div>

          {/* Diagnostics section */}
          {showDiagnostics && diagnostics && (
            <div className="mt-4 border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Connection Diagnostics:</h3>
              <div className="text-xs bg-gray-50 p-3 rounded font-mono overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(diagnostics, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminErrorState;
