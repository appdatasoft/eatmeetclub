
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Settings } from 'lucide-react';
import { Button } from '../ui/button';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if user is logged in
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!sessionData.session) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Authentication required",
            description: "You need to be logged in to access the admin area",
            variant: "destructive"
          });
          // Store the current path for redirect after login
          localStorage.setItem('redirectAfterLogin', location.pathname);
          navigate('/login');
          return;
        }
        
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase.rpc(
          'is_admin',
          { user_id: sessionData.session.user.id }
        );
        
        if (adminError) {
          throw adminError;
        }
        
        if (!adminData) {
          console.log("User is not an admin, redirecting to dashboard");
          toast({
            title: "Access denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        setIsAdmin(true);
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        setError(error.message || "Failed to verify admin status");
        toast({
          title: "Error",
          description: error.message || "Failed to verify admin status",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Admin check timed out, showing error state");
        setIsLoading(false);
        setError("Verification timed out. Please refresh the page or try again later.");
      }
    }, 10000); // 10 second timeout
    
    checkAdminStatus();
    
    return () => clearTimeout(timeoutId);
  }, [navigate, toast, location.pathname]);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50';
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Verifying admin credentials...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
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
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-medium text-lg">Admin Dashboard</h2>
                </div>
                <nav className="p-2">
                  <ul className="space-y-1">
                    <li>
                      <Link 
                        to="/admin" 
                        className={`block px-3 py-2 rounded-md ${isActive('/admin')}`}
                      >
                        Overview
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/config" 
                        className={`block px-3 py-2 rounded-md ${isActive('/admin/config')}`}
                      >
                        Configuration
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/users" 
                        className={`block px-3 py-2 rounded-md ${isActive('/admin/users')}`}
                      >
                        Manage Users
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLayout;
