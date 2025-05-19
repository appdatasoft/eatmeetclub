
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PlusCircle, CreditCard, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/') 
      ? 'bg-brand-50 text-brand-600 font-medium' 
      : 'text-gray-600 hover:bg-gray-50';
  };
  
  return (
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
              <Link 
                to="/dashboard/payments" 
                className={`block px-3 py-2 rounded-md ${isActive('/dashboard/payments')}`}
              >
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>Payments</span>
                </div>
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard/social-media" 
                className={`block px-3 py-2 rounded-md ${isActive('/dashboard/social-media')}`}
              >
                <div className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2" />
                  <span>Social Media</span>
                </div>
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
  );
};

export default DashboardSidebar;
