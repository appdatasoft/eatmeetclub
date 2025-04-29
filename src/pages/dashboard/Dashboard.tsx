
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/login');
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
          <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/dashboard/create-event')}
              className="w-full py-2 px-4 bg-brand-50 text-brand-600 rounded-md text-sm font-medium text-left hover:bg-brand-100"
            >
              Create New Event
            </button>
            <button 
              onClick={() => navigate('/dashboard/add-restaurant')}
              className="w-full py-2 px-4 bg-brand-50 text-brand-600 rounded-md text-sm font-medium text-left hover:bg-brand-100"
            >
              Add New Restaurant
            </button>
          </div>
        </div>
        
        <div className="border border-gray-100 rounded-lg p-5">
          <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
          <p className="text-gray-500 text-sm">No upcoming events scheduled.</p>
        </div>
      </div>
      
      <div className="mt-6 border border-gray-100 rounded-lg p-5">
        <h3 className="text-lg font-medium mb-4">Your Restaurants</h3>
        <p className="text-gray-500 text-sm">No restaurants added yet.</p>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
