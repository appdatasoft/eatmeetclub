import { Link, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Mail, 
  MessageSquare, 
  Globe, 
  ShoppingCart,
  CreditCard,
  DollarSign,
  Instagram
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50';
  };

  const isSubActive = (path: string) => {
    return location.pathname === path ? 'text-brand-600 font-medium' : 'text-gray-500 hover:text-gray-700';
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
              <div className="space-y-1">
                <Link 
                  to="/admin/contracts" 
                  className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/contracts')}`}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Contracts</span>
                </Link>
                <ul className="pl-8 space-y-1">
                  <li>
                    <Link
                      to="/admin/contracts/venue"
                      className={`text-sm block py-1 px-2 rounded ${isSubActive('/admin/contracts/venue')}`}
                    >
                      Venue Contract
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/contracts/signup-referral"
                      className={`text-sm block py-1 px-2 rounded ${isSubActive('/admin/contracts/signup-referral')}`}
                    >
                      Signup Referral Fee
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/contracts/ticket-fee"
                      className={`text-sm block py-1 px-2 rounded ${isSubActive('/admin/contracts/ticket-fee')}`}
                    >
                      Ticket Fee
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
            <li>
              <Link 
                to="/admin/orders" 
                className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/orders')}`}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                <span>Orders</span>
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
                to="/admin/payment" 
                className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/payment')}`}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Payment</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/fees" 
                className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/fees')}`}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Fees</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/social-media" 
                className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/social-media')}`}
              >
                <Instagram className="h-4 w-4 mr-2" />
                <span>Social Media</span>
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
            <li>
              <Link 
                to="/admin/stripe-settings" 
                className={`flex items-center px-3 py-2 rounded-md ${isActive('/admin/stripe-settings')}`}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <span>Stripe Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
