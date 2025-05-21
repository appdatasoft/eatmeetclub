
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, Settings, FileText, Mail, MessageSquare, 
  Home, Building, Calendar, ShoppingBag, CreditCard, 
  Percent, Share2, Flag
} from 'lucide-react';

const AdminSidebar = () => {
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <Home className="w-5 h-5" />
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'Events',
      path: '/admin/events',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingBag className="w-5 h-5" />
    },
    {
      name: 'Venues',
      path: '/admin/venus',
      icon: <Building className="w-5 h-5" />
    },
    {
      name: 'Emails',
      path: '/admin/emails',
      icon: <Mail className="w-5 h-5" />
    },
    {
      name: 'SMS',
      path: '/admin/sms',
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      name: 'Contracts',
      path: '/admin/contracts',
      icon: <FileText className="w-5 h-5" />
    },
    {
      name: 'Templates',
      path: '/admin/templates',
      icon: <FileText className="w-5 h-5" />
    },
    {
      name: 'Payment',
      path: '/admin/payment',
      icon: <CreditCard className="w-5 h-5" />
    },
    {
      name: 'Fees',
      path: '/admin/fees',
      icon: <Percent className="w-5 h-5" />
    },
    {
      name: 'Social Media',
      path: '/admin/social-media',
      icon: <Share2 className="w-5 h-5" />
    },
    {
      name: 'Feature Flags',
      path: '/admin/feature-flags',
      icon: <Flag className="w-5 h-5" />
    },
    {
      name: 'Config',
      path: '/admin/config',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:col-span-1">
      <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          {navigationItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => 
                  `flex items-center p-2 rounded-md hover:bg-gray-100 transition-colors ${
                    isActive ? 'bg-gray-100 text-primary font-medium' : 'text-gray-700'
                  }`
                }
                end={item.path === '/admin'}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
