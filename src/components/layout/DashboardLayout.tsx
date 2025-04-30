
import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { supabase } from '@/integrations/supabase/client';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check if user is logged in
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session?.user) {
          // Check if user is an admin
          const { data, error } = await supabase.rpc(
            'is_admin',
            { user_id: sessionData.session.user.id }
          );
          
          if (error) {
            throw error;
          }
          
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, []);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/') 
      ? 'bg-brand-50 text-brand-600 font-medium' 
      : 'text-gray-600 hover:bg-gray-50';
  };

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
                        Add Restaurant
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/dashboard/memories" 
                        className={`block px-3 py-2 rounded-md ${isActive('/dashboard/memories')}`}
                      >
                        Memories
                      </Link>
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
                          to="/dashboard/users" 
                          className={`block px-3 py-2 rounded-md ${isActive('/dashboard/users')}`}
                        >
                          Manage Users
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
