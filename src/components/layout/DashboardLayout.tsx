import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/hooks/useAuth';
import { PlusCircle } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading } = useAuth();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  
  useEffect(() => {
    // Only redirect if not loading and no user, and we haven't tried redirecting yet
    if (!isLoading && !user && !redirectAttempted) {
      console.log("Not authenticated, redirecting to login");
      setRedirectAttempted(true);
      
      // Store the current path for redirect after login
      localStorage.setItem('redirectAfterLogin', location.pathname);
      
      // Show toast notification
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard",
      });
      
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, isLoading, location.pathname, redirectAttempted, toast]);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/') 
      ? 'bg-brand-50 text-brand-600 font-medium' 
      : 'text-gray-600 hover:bg-gray-50';
  };

  // Prevent infinite loading if auth takes too long
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("Auth check taking too long, forcing refresh");
        window.location.reload();
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Return null to avoid rendering the layout before redirect happens
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
                  <h2 className="font-medium text-lg">Dashboard</h2>
                </div>
                <nav className="p-2">
                  <ul className="space-y-1">
                    <li>
                      <Link 
                        to="/dashboard" 
                        className={`block px-3 py-2 rounded-md ${isActive('/dashboard')}`}
                      >
                        Overview
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/dashboard/events" 
                        className={`block px-3 py-2 rounded-md ${isActive('/dashboard/events')}`}
                      >
                        Events Management
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/dashboard/create-event" 
                        className={`block px-3 py-2 rounded-md ${isActive('/dashboard/create-event')}`}
                      >
                        Create Event
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/dashboard/add-restaurant" 
                        className={`block px-3 py-2 rounded-md ${isActive('/dashboard/add-restaurant')}`}
                      >
                        Restaurants
                      </Link>
                    </li>
                    <li>
                      <div className="flex justify-between items-center">
                        <Link 
                          to="/dashboard/memories" 
                          className={`block flex-grow px-3 py-2 rounded-md ${isActive('/dashboard/memories')}`}
                        >
                          Memories
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => navigate('/dashboard/create-memory')}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                    <li>
                      <Link 
                        to="/dashboard/settings" 
                        className={`block px-3 py-2 rounded-md ${isActive('/dashboard/settings')}`}
                      >
                        Settings
                      </Link>
                    </li>
                    {isAdmin && (
                      <li className="pt-2 mt-2 border-t border-gray-100">
                        <div className="px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admin
                        </div>
                        <Link 
                          to="/dashboard/admin-settings" 
                          className={`block px-3 py-2 rounded-md ${isActive('/dashboard/admin-settings')}`}
                        >
                          Admin Settings
                        </Link>
                        <Link 
                          to="/admin" 
                          className={`block px-3 py-2 rounded-md ${isActive('/admin')}`}
                        >
                          Admin Dashboard
                        </Link>
                      </li>
                    )}
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

export default DashboardLayout;
