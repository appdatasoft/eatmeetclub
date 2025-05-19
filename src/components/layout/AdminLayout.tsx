
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Calendar, FileText, Mail, MessageSquare, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { get } from '@/lib/fetch-client';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';

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
  const [authCheckTimedOut, setAuthCheckTimedOut] = useState(false);
  const { user } = useAuth(); // Use the auth hook
  
  useEffect(() => {
    // Track if component is mounted to prevent state updates after unmount
    let isMounted = true;
    
    const checkAdminStatus = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        if (!user) {
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
        
        // Check if user is admin with safer implementation
        const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (error) {
          console.error("Admin check error:", error);
          throw new Error(error.message);
        }
        
        if (!data) {
          console.log("User is not an admin, redirecting to dashboard");
          toast({
            title: "Access denied",
            description: "You don't have admin privileges",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }
        
        if (isMounted) {
          console.log("Admin check passed, allowing access");
          setIsAdmin(true);
        }
      } catch (error: any) {
        console.error('Error checking admin status:', error);
        if (isMounted) {
          setError(error.message || "Failed to verify admin status");
          toast({
            title: "Error",
            description: error.message || "Failed to verify admin status",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Admin check timed out");
        setAuthCheckTimedOut(true);
        setIsLoading(false);
        setError("Verification timed out. Please refresh the page or try again later.");
      }
    }, 3000); // Reduced from 5 to 3 seconds for faster feedback
    
    checkAdminStatus();
    
    // Cleanup function to prevent memory leaks and state updates after unmount
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [navigate, toast, location.pathname, user]);
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50';
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (isLoading && !authCheckTimedOut) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="medium" text="Verifying admin credentials..." />
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
              <Button variant="outline" onClick={handleRetry}>
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
    // Return minimal loading component while redirecting
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Redirecting...</p>
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
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin')}`}
                      >
                        <span>Overview</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/contracts" 
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/contracts')}`}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Contracts</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/emails" 
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/emails')}`}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Emails</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/sms" 
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/sms')}`}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span>SMS</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/venus" 
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/venus')}`}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        <span>Venus</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/events" 
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/events')}`}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Events</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/config" 
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/config')}`}
                      >
                        <span>Configuration</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin/users" 
                        className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/users')}`}
                      >
                        <span>Manage Users</span>
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
