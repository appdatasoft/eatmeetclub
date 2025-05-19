
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardSidebar from './dashboard/DashboardSidebar';
import DashboardContent from './dashboard/DashboardContent';
import DashboardLoadingState from './dashboard/DashboardLoadingState';
import RedirectState from './dashboard/RedirectState';
import { useDashboardAuth } from './dashboard/useDashboardAuth';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { 
    user, 
    isLoading,
    authCheckTimeout,
    redirectAttempted,
    setRedirectAttempted,
    currentPath,
    showToast 
  } = useDashboardAuth();
  
  useEffect(() => {
    // Only redirect if not loading and no user, and we haven't tried redirecting yet
    if ((!isLoading || authCheckTimeout) && !user && !redirectAttempted) {
      console.log("Not authenticated, redirecting to login");
      setRedirectAttempted(true);
      
      // Store the current path for redirect after login
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      // Show toast notification
      showToast(
        "Authentication Required",
        "Please log in to access the dashboard"
      );
      
      navigate('/login', { state: { from: currentPath } });
    }
  }, [user, navigate, isLoading, currentPath, redirectAttempted, authCheckTimeout, setRedirectAttempted, showToast]);

  if (isLoading) {
    return <DashboardLoadingState />;
  }

  if (!user) {
    // Return minimal loading state while redirect happens
    return <RedirectState />;
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <DashboardSidebar />
            
            {/* Main Content */}
            <DashboardContent>
              {children}
            </DashboardContent>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DashboardLayout;
