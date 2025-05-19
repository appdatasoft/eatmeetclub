
import { Link, useLocation } from 'react-router-dom';
import { Calendar, FileText, Mail, MessageSquare, Globe } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50';
  };

  return (
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
                to="/admin/templates" 
                className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/templates')}`}
              >
                <FileText className="h-4 w-4 mr-2" />
                <span>Templates</span>
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
  );
};

export default AdminSidebar;
