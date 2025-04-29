
import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50';
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
