
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminSidebar from './admin/AdminSidebar';
import AdminContent from './admin/AdminContent';
import AdminErrorState from './admin/AdminErrorState';
import AdminLoadingState from './admin/AdminLoadingState';
import { useAdminAuth } from './admin/useAdminAuth';
import RetryAlert from '@/components/ui/RetryAlert';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAdmin, isLoading, error, authCheckTimedOut, handleRetry, isRetrying } = useAdminAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  // Check network connection status and show alert if offline
  useEffect(() => {
    const handleOnlineStatus = () => {
      setShowOfflineAlert(!navigator.onLine);
    };

    // Initial check
    handleOnlineStatus();

    // Set up event listeners
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // Add effect to redirect non-admin users faster
  useEffect(() => {
    if (!isLoading && !isAdmin && !error) {
      setRedirecting(true);
      // Use a short timeout to ensure redirect happens after render
      const redirectTimeout = setTimeout(() => {
        navigate('/dashboard');
      }, 50);
      return () => clearTimeout(redirectTimeout);
    }
  }, [isLoading, isAdmin, error, navigate]);

  // Show network connection warning if offline
  if (showOfflineAlert) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen">
          <div className="container-custom py-8">
            <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-md mb-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">Network Connection Issue</h2>
              <p className="text-yellow-700 mb-2">You appear to be offline. Please check your internet connection.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isLoading && !authCheckTimedOut) {
    return <AdminLoadingState text="Verifying admin access..." />;
  }

  if (authCheckTimedOut) {
    return <AdminErrorState 
      error="Verification timed out. Please try again." 
      onRetry={handleRetry} 
      isRetrying={isRetrying}
    />;
  }

  if (error) {
    return <AdminErrorState 
      error={error} 
      onRetry={handleRetry}
      isRetrying={isRetrying}
    />;
  }

  if (!isAdmin || redirecting) {
    // Return minimal loading component while redirecting
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Redirecting to dashboard...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <AdminSidebar />
            
            {/* Main Content */}
            <AdminContent>
              {children}
            </AdminContent>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLayout;
