
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminSidebar from './admin/AdminSidebar';
import AdminContent from './admin/AdminContent';
import AdminErrorState from './admin/AdminErrorState';
import AdminLoadingState from './admin/AdminLoadingState';
import { useAdminAuth } from './admin/useAdminAuth';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAdmin, isLoading, error, authCheckTimedOut, handleRetry } = useAdminAuth();
  const navigate = useNavigate();

  // Add effect to redirect non-admin users faster
  useEffect(() => {
    if (!isLoading && !isAdmin && !error) {
      // Use a short timeout to ensure redirect happens after render
      const redirectTimeout = setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      return () => clearTimeout(redirectTimeout);
    }
  }, [isLoading, isAdmin, error, navigate]);

  if (isLoading && !authCheckTimedOut) {
    return <AdminLoadingState />;
  }

  if (error) {
    return <AdminErrorState error={error} onRetry={handleRetry} />;
  }

  if (!isAdmin) {
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
